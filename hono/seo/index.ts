import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';

// const storesMap = {

// }

export const renderIndexPage = async (c: Context) => {
  // const productId = c.req.param('productId');

  const websiteDetails = c.get('storeInfo');
  // console.log(websiteDetails);

  if (!websiteDetails) {
    // console.log('====================== > storeInfo', c.get('storeInfo'));
    return c.html(
      await renderSSRPage({
        c: c,
        title: c.req.header('host') || 'Apporix Apparel',
        description: c.req.header('host') || 'Apporix Apparel',
        url: `https://apporixapparel.com`,
        bodyContent: `<h1>Apporix Apparel</h1>`
      })
    );
  }

  const html = await renderSSRPage({
    c: c,
    title: `${websiteDetails.metaTitle}`,
    description: websiteDetails.metaDescription || '',
    keywords: websiteDetails.metaKeywords?.join(',') || '',
    image: `${process.env.VITE_API_DOMAIN}/img/logo.png`,
    url: `https://` + (websiteDetails.customDomain || websiteDetails.subDomain + `.khudroshop.com`),
    type: 'product',
    bodyContent: `<h1>${websiteDetails.metaTitle}</h1>
    <p>${websiteDetails.metaDescription}
    </p>`,
    brandColor: websiteDetails.brandColor
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Accept-Ranges': 'none',
      'cf-edge-cache': 'bypass', // <--- tells Cloudflare edge to serve full body
      'Content-Length': Buffer.byteLength(html, 'utf-8').toString()
    }
  });
};
