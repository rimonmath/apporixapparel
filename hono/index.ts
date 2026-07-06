import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import apiRoutes from './api/index.js';
import { hc as hcClient } from 'hono/client';
import { HTTPException } from 'hono/http-exception';
import { serveStatic } from '@hono/node-server/serve-static';
import { html, raw } from 'hono/html';
import path from 'node:path';
import fs from 'node:fs';
import { db } from './db/index.js';
import { renderIndexPage } from './seo/index.js';
import { renderProductPage } from './seo/products.js';
import { renderCategoryPage } from './seo/categories.js';
import { renderPagePage } from './seo/pages.js';
import { renderUserProductPage } from './seo/userproducts.js';
import { renderSearchPage } from './seo/search.js';
// import { initStores } from './middleware/storeInfo.js';
import { renderSigninPage } from './seo/signin.js';
import { renderSignupPage } from './seo/signup.js';

const app = new Hono().use(cors()).route('/api', apiRoutes);

app.get('/', renderIndexPage);
app.get('/r/:refCode', renderSignupPage);
app.get('/auth/signup', renderSignupPage);
app.get('/auth/signin', renderSigninPage);
app.get('/index.html', renderIndexPage);
app.get('/checkout', renderIndexPage);
app.get('/products/:productId/:productTitle', renderProductPage);
app.get('/products/:productId/:productTitle/index.html', renderProductPage);
app.get('/categories/:categoryId/:categoryName', renderCategoryPage);
app.get('/pages/:pageId/:pageName', renderPagePage);
app.get('/user-products/:userId/:userName', renderUserProductPage);
app.get('/search/:keyword', renderSearchPage);

app.use('/*', serveStatic({ root: './uploads' }));
app.use('/*', serveStatic({ root: './dist' }));
app.use('/*', serveStatic({ path: './dist/index.html' }));

app.onError((err: any, c) => {
  console.log(err);
  console.log(err?.cause?.detail);
  if (err instanceof HTTPException) {
    if (err.message) {
      return c.json({ message: err.message }, 400);
    }

    return err.getResponse();
  }

  // Check unique insert error
  if (err?.cause?.detail) {
    const match = err.cause.detail.match(/Key \((.+)\)=\((.+)\) already exists/);
    if (match) {
      const [, field, value] = match;
      // console.log(`${field} ${value} already exists`);
      // 👉 "email chalakhasan@gmail.com already exists"

      return c.json({ message: `Already exists` }, 400);
    } else {
      // console.log(err.cause.detail);
    }
  }

  // console.log('error=======================>', err);

  if (err.message && !err.message.startsWith('Failed query:')) {
    return c.json({ message: err.message }, 400);
  }

  // fallback for unhandled errors
  return c.json({ message: 'Internal Server Error...' }, 500);
});

type App = typeof app;

type Client = ReturnType<typeof hcClient<App>>;

const hc = (...args: Parameters<typeof hcClient>): Client => hcClient<App>(...args);
export const client = hc('');
// export default app
serve({
  fetch: app.fetch,
  port: 3124
});

// initStores();

console.log('Hono app is running on http://localhost:3124');
