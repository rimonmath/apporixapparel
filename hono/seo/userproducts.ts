import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';
import { replaceSpaces } from '../utils/functions.js';
import { html, raw } from 'hono/html';

export const renderUserProductPage = async (c: Context) => {
  const userId = c.req.param('userId');

  // fetch userDetails from DB...
  const userDetails = await db.query.Users.findFirst({
    where: (fields, { eq }) => eq(fields.id, Number(userId))
  });

  if (!userDetails) {
    return c.html(
      await renderSSRPage({
        c: c,
        title: `User not found | ${process.env.VITE_WEBSITE_NAME || 'Khudroshop'}`,
        description: 'This user does not exist',
        url: `${process.env.VITE_API_DOMAIN}/user-products/${userId}/${c.req.param('userName')}`,
        bodyContent: `<h1>User not found</h1>`
      })
    );
  }

  const htmlCode = await renderSSRPage({
    c: c,
    title: `All products by ${userDetails.name} | ${process.env.VITE_WEBSITE_NAME}`,
    description: `List of all products by ${userDetails.name}`,
    keywords: 'product, shop',
    url: `${process.env.VITE_API_DOMAIN}/user-products/${userId}/${c.req.param('userName')}`,
    type: 'product',
    bodyContent: `<h1>All products by ${userDetails.name} </h1>`
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
