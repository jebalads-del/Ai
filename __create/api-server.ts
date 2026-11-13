import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
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

for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024,
      onError: (c) => c.json({ error: 'حجم الطلب كبير جدًا' }, 413),
    })
  );
}

app.route(API_BASENAME, api);

export default app;
