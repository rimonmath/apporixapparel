import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';
import { replaceSpaces } from '../utils/functions.js';

export const renderProductPage = async (c: Context) => {
  const productId = c.req.param('productId');

  // fetch productDetails from DB...
  const productDetails = await db.query.Products.findFirst({
    with: {
      images: true,
      store: {
        columns: {
          id: true,
          name: true,
          brandColor: true
        }
      }
    },
    where: (fields, { eq, and }) =>
      and(
        eq(fields.id, Number(productId)),
        eq(fields.storeId, c.get('storeInfo').storeId),
        eq(fields.serverId, c.get('storeInfo').serverId)
      )
  });

  if (!productDetails) {
    return c.html(
      await renderSSRPage({
        c: c,
        title: `Product not found | ${process.env.VITE_WEBSITE_NAME || 'Khudroshop'}`,
        description: 'This product does not exist',
        url: `${process.env.VITE_API_DOMAIN}/product/${productId}/${c.req.param('productName')}`,
        bodyContent: `<h1>Product not found</h1>`
      })
    );
  }

  const htmlCode = await renderSSRPage({
    title: `${productDetails.title} | ${productDetails.store.name}`,
    description: productDetails.description || 'No description',
    keywords: productDetails.tags?.join(',') || 'product, shop',
    image: productDetails.images?.[0]?.url
      ? `${process.env.VITE_API_DOMAIN}${productDetails.images?.[0]?.url}`
      : `${process.env.VITE_API_DOMAIN}default-product.jpg`,
    url: `${process.env.VITE_API_DOMAIN}/product/${productId}/${replaceSpaces(productDetails.title)}`,
    type: 'product',
    bodyContent: `<h1>${productDetails.title}</h1><p>${productDetails.description}</p>`,
    brandColor: String(productDetails.store.brandColor),
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
