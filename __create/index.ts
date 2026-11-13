import { Hono } from 'hono';
import { createRequestHandler } from 'react-router';
// @ts-expect-error - virtual React Router build module
import * as build from 'virtual:react-router/server-build';
import apiApp from './api-server';

const app = new Hono();
const requestHandler = createRequestHandler(
  build,
  import.meta.env.DEV ? 'development' : 'production'
);

app.all('/api', (c) => apiApp.fetch(c.req.raw));
app.all('/api/*', (c) => apiApp.fetch(c.req.raw));
app.all('*', (c) => requestHandler(c.req.raw));

export default import.meta.env.DEV ? app : app.fetch;
