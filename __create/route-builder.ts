import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
type RouteMethod = (typeof methods)[number];
type RouteModule = Partial<
  Record<
    RouteMethod,
    (request: Request, options: { params: Record<string, string> }) => Response | Promise<Response>
  >
>;
const routeModules = import.meta.glob('../src/app/api/**/route.js') as Record<
  string,
  () => Promise<RouteModule>
>;

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace('../src/app/api/', '');
  const routeParts = relativePath.split('/').slice(0, -1);
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  return routeParts.map((segment) => {
    const match = segment.match(/^\[(\.\.\.)?([^\]]+)\]$/);
    if (match) {
      const [, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
}

async function registerRoutes() {
  const routeFiles = Object.keys(routeModules).sort((a, b) => b.length - a.length);
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      const loadRoute = routeModules[routeFile];
      const route = await loadRoute();
      for (const method of methods) {
        const routeHandler = route[method];
        if (!routeHandler) continue;
        const parts = getHonoPath(routeFile);
        const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
        const handler: Handler = async (c) => {
          const currentRoute = import.meta.env.DEV ? await loadRoute() : route;
          return currentRoute[method]!(c.req.raw, { params: c.req.param() });
        };
        switch (method) {
          case 'GET':
            api.get(honoPath, handler);
            break;
          case 'POST':
            api.post(honoPath, handler);
            break;
          case 'PUT':
            api.put(honoPath, handler);
            break;
          case 'DELETE':
            api.delete(honoPath, handler);
            break;
          case 'PATCH':
            api.patch(honoPath, handler);
            break;
        }
      }
    } catch (error) {
      console.error(`Error registering route ${routeFile}:`, error);
    }
  }
}

await registerRoutes();

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept(() => {
    registerRoutes().catch((error) => {
      console.error('Error reloading routes:', error);
    });
  });
}

export { api, API_BASENAME };
