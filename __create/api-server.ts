import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { requestId } from 'hono/request-id';
import { API_BASENAME, api } from './route-builder';

const app = new Hono();

app.use('*', requestId());
app.use(contextStorage());

app.onError((error, c) => {
  console.error('API request failed:', error);
  return c.json({ error: 'حدث خطأ في الخادم' }, 500);
});

app.use('*', async (c, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(c.req.method) || !c.req.raw.body) {
    return next();
  }

  const reader = c.req.raw.clone().body!.getReader();
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4.5 * 1024 * 1024) {
      await reader.cancel();
      return c.json({ error: 'حجم الطلب كبير جدًا' }, 413);
    }
  }
  return next();
});

app.route(API_BASENAME, api);

export default app;
