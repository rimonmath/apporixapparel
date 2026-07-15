import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';
import { replaceSpaces } from '../utils/functions.js';
import { html, raw } from 'hono/html';

export const renderCategoryPage = async (c: Context) => {
  const categoryId = c.req.param('categoryId');

  // fetch categoryDetails from DB...
  const categoryDetails = await db.query.Categories.findFirst({
    with: {
      store: {
        columns: {
          id: true,
          name: true,
          brandColor: true
        }
      }
    },
    where: (fields, { eq, and }) => and(eq(fields.id, Number(categoryId)))
  });

  if (!categoryDetails) {
    return c.html(
      await renderSSRPage({
        c: c,
        title: `Category not found | ${process.env.VITE_WEBSITE_NAME}`,
        description: 'This category does not exist',
        url: `${process.env.VITE_API_DOMAIN}/categories/${categoryId}/${c.req.param('categoryId')}`,
        bodyContent: `<h1>Category not found</h1>`
      })
    );
  }

  const htmlCode = await renderSSRPage({
    title: `${categoryDetails.metaTitle || categoryDetails.name || process.env.VITE_WEBSITE_NAME}`,
    description: categoryDetails.metaDescription || 'No description',
    keywords: 'product, shop',
    image: `${process.env.VITE_API_DOMAIN}/img/logo.png`,
    url: `${process.env.VITE_API_DOMAIN}/categories/${categoryId}/${replaceSpaces(categoryDetails.name)}`,
    type: 'product',
    bodyContent: `<h1>${categoryDetails.name}</h1><p>${categoryDetails.metaDescription}</p>`,
    brandColor: `#db6300`,
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
