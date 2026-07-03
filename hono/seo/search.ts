import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';
import { replaceSpaces } from '../utils/functions.js';
import { html, raw } from 'hono/html';

export const renderSearchPage = async (c: Context) => {
  const keyword = c.req.param('keyword');

  const htmlCode = await renderSSRPage({
    c: c,
    title: `All ${keyword} Products | ${process.env.VITE_WEBSITE_NAME}`,
    description: `All ${keyword} Products | ${process.env.VITE_WEBSITE_NAME}`,
    keywords: 'product, shop',
    url: `${process.env.VITE_API_DOMAIN}/search/${keyword}`,
    type: 'product',
    bodyContent: `<h1>All ${keyword} Products | ${process.env.VITE_WEBSITE_NAME}</h1>`
  });

  //   const Footer = () => html`
  //   ${htmlCode}
  // `

  // return c.html(<Footer />);
  // return c.html(htmlCode);
  // return c.html(html`${raw(htmlCode)}`);

  return new Response(htmlCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Accept-Ranges': 'none',
      'cf-edge-cache': 'bypass', // <--- tells Cloudflare edge to serve full body
      'Content-Length': Buffer.byteLength(htmlCode, 'utf-8').toString()
    }
  });
};
