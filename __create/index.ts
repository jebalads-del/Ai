import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import { skipCSRFCheck } from '@auth/core';
import type { Adapter, AdapterSession, AdapterUser, VerificationToken } from '@auth/core/adapters';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import postgres from 'postgres';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

// تأكد من وجود مجلد الـ api لمنع خطأ ENOENT أثناء فحص المسارات
try {
  const apiDirpath = path.join(process.cwd(), 'src/app/api');
  if (!fs.existsSync(apiDirpath)) {
    fs.mkdirSync(apiDirpath, { recursive: true });
  }
} catch {}

const als = new AsyncLocalStorage<{ requestId: string }>();

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 1,
  prepare: false,
});

function createPostgresAdapter(client: ReturnType<typeof postgres>): Adapter & {
  getUserByEmail(email: string): Promise<any>;
  linkAccount(data: any): Promise<any>;
} {
  return {
    async createVerificationToken(verificationToken: VerificationToken) {
      const { identifier, expires, token } = verificationToken;
      await client`
        INSERT INTO auth_verification_token (identifier, expires, token)
        VALUES (${identifier}, ${expires}, ${token})
      `;
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const rows = await client`
        DELETE FROM auth_verification_token
        WHERE identifier = ${identifier} AND token = ${token}
        RETURNING identifier, expires, token
      `;
      return rows.length > 0 ? (rows[0] as VerificationToken) : null;
    },
    async createUser(user: Omit<AdapterUser, 'id'>) {
      const { name, email, emailVerified, image } = user;
      const rows = await client`
        INSERT INTO auth_users (name, email, "emailVerified", image)
        VALUES (${name ?? null}, ${email}, ${emailVerified ?? null}, ${image ?? null})
        RETURNING id, name, email, "emailVerified", image
      `;
      return rows[0] as AdapterUser;
    },
    async getUser(id: string) {
      try {
        const rows = await client`SELECT * FROM auth_users WHERE id = ${id}`;
        return rows.length > 0 ? (rows[0] as AdapterUser) : null;
      } catch {
        return null;
      }
    },
    async getUserByEmail(email: string) {
      const users = await client`SELECT * FROM auth_users WHERE email = ${email}`;
      if (users.length === 0) return null;
      const userData = users[0];
      const accounts = await client`SELECT * FROM auth_accounts WHERE "userId" = ${userData.id}`;
      return { ...userData, accounts };
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const rows = await client`
        SELECT u.* FROM auth_users u
        JOIN auth_accounts a ON u.id = a."userId"
        WHERE a.provider = ${provider} AND a."providerAccountId" = ${providerAccountId}
      `;
      return rows.length > 0 ? (rows[0] as AdapterUser) : null;
    },
    async updateUser(user: Partial<AdapterUser>) {
      const existing = await client`SELECT * FROM auth_users WHERE id = ${user.id!}`;
      const merged = { ...existing[0], ...user };
      const rows = await client`
        UPDATE auth_users
        SET name = ${merged.name ?? null}, email = ${merged.email}, "emailVerified" = ${merged.emailVerified ?? null}, image = ${merged.image ?? null}
        WHERE id = ${merged.id}
        RETURNING name, id, email, "emailVerified", image
      `;
      return rows[0] as AdapterUser;
    },
    async linkAccount(account: any) {
      const rows = await client`
        INSERT INTO auth_accounts (
          "userId", provider, type, "providerAccountId", access_token,
          expires_at, refresh_token, id_token, scope, session_state, token_type, password
        )
        VALUES (
          ${account.userId}, ${account.provider}, ${account.type}, ${account.providerAccountId},
          ${account.access_token ?? null}, ${account.expires_at ?? null}, ${account.refresh_token ?? null},
          ${account.id_token ?? null}, ${account.scope ?? null}, ${account.session_state ?? null},
          ${account.token_type ?? null}, ${account.extraData?.password ?? null}
        )
        RETURNING *
      `;
      return rows[0];
    },
    async createSession({ sessionToken, userId, expires }) {
      if (!userId) throw new Error('userId is undefined in createSession');
      const rows = await client`
        INSERT INTO auth_sessions ("userId", expires, "sessionToken")
        VALUES (${userId}, ${expires}, ${sessionToken})
        RETURNING id, "sessionToken", "userId", expires
      `;
      return rows[0] as AdapterSession;
    },
    async getSessionAndUser(sessionToken: string) {
      if (!sessionToken) return null;
      const sessions = await client`SELECT * FROM auth_sessions WHERE "sessionToken" = ${sessionToken}`;
      if (sessions.length === 0) return null;
      const session = sessions[0] as AdapterSession;
      const users = await client`SELECT * FROM auth_users WHERE id = ${session.userId}`;
      if (users.length === 0) return null;
      return { session, user: users[0] as AdapterUser };
    },
    async updateSession(session) {
      const rows = await client`
        UPDATE auth_sessions
        SET expires = ${session.expires!}
        WHERE "sessionToken" = ${session.sessionToken}
        RETURNING *
      `;
      return rows.length > 0 ? (rows[0] as AdapterSession) : null;
    },
    async deleteSession(sessionToken: string) {
      await client`DELETE FROM auth_sessions WHERE "sessionToken" = ${sessionToken}`;
    },
    async unlinkAccount({ provider, providerAccountId }) {
      await client`
        DELETE FROM auth_accounts
        WHERE "providerAccountId" = ${providerAccountId} AND provider = ${provider}
      `;
    },
    async deleteUser(userId: string) {
      await client`DELETE FROM auth_users WHERE id = ${userId}`;
      await client`DELETE FROM auth_sessions WHERE "userId" = ${userId}`;
      await client`DELETE FROM auth_accounts WHERE "userId" = ${userId}`;
    },
  };
}

const adapter = createPostgresAdapter(sql);

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);
  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}

for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024,
      onError: (c) => c.json({ error: 'Body size limit exceeded' }, 413),
    })
  );
}

if (process.env.AUTH_SECRET) {
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: c.env.AUTH_SECRET,
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
        error: '/account/signin',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: { options: { secure: true, sameSite: 'none' } },
        sessionToken: { options: { secure: true, sameSite: 'none' } },
        callbackUrl: { options: { secure: true, sameSite: 'none' } },
      },
      providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }
            const user = await adapter.getUserByEmail(email);
            if (!user) return null;

            const matchingAccount = user.accounts.find(
              (account: any) => account.provider === 'credentials'
            );
            if (!matchingAccount?.password) return null;

            const isValid = await verify(matchingAccount.password, password);
            if (!isValid) return null;

            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: { password: await hash(password) },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: String(newUser.id),
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
      ],
    }))
  );
}

app.all('/integrations/:path{.+}', async (c) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-expect-error -- duplex is accepted by runtime
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST!,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST!,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST!,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID!,
    },
  });
});

app.all('/api/auth/*', async (c, next) => {
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});

app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
