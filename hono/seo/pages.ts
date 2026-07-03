import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';
import { replaceSpaces } from '../utils/functions.js';
import { html, raw } from 'hono/html';

export const renderPagePage = async (c: Context) => {
  const pageId = c.req.param('pageId');

  // fetch pageDetails from DB...
  const pageDetails = await db.query.Pages.findFirst({
    with: {
      store: {
        columns: {
          brandColor: true
        }
      }
    },
    where: (fields, { eq, and }) =>
      and(
        eq(fields.id, Number(pageId)),
        eq(fields.storeId, c.get('storeInfo').storeId),
        eq(fields.serverId, c.get('storeInfo').serverId)
      )
  });

  if (!pageDetails) {
    return c.html(
      await renderSSRPage({
        c: c,
        title: `Product not found | ${process.env.VITE_WEBSITE_NAME || 'Khudroshop'}`,
        description: 'This product does not exist',
        url: `${process.env.VITE_API_DOMAIN}/product/${pageId}`,
        bodyContent: `<h1>Product not found</h1>`
      })
    );
  }

  const htmlCode = await renderSSRPage({
    title: `${pageDetails.title} | ${process.env.VITE_WEBSITE_NAME}`,
    description: pageDetails.description || 'No description',
    keywords: 'product, shop',
    url: `${process.env.VITE_API_DOMAIN}/pages/${pageId}/${replaceSpaces(pageDetails.name)}`,
    type: 'product',
    bodyContent: `<h1>${pageDetails.title}</h1><p>${pageDetails.description}</p>`,
    brandColor: String(pageDetails.store.brandColor),
    c: c
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
