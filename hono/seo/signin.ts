import { Context } from 'hono';
import { renderSSRPage } from './ssr.js';
import { db } from '../db/index.js';

// const storesMap = {

// }

export const renderSigninPage = async (c: Context) => {
  // const productId = c.req.param('productId');

  const websiteDetails = {
    storeId: 0,
    serverId: 0,
    packageExpiry: '',
    name: 'Apporix Apparel',
    subDomain: '',
    customDomain: `https://apporixapparel.com`,
    metaTitle:
      'Apporix Apparel, Empowering small businesses with simple, powerful tools to manage their online presence.',
    metaDescription: 'Apporix Apparel is a platform to sell products online.',
    metaKeywords: ['website', 'app', 'shop', 'bangla', 'bangladesh'],
    logoUrl: '/img/logo.png',
    brandColor: '#db6300',
    faviconUrl: '/favicon.png',
    currency: '',
    timezone: '',
    status: ''
  };
  //c.get('storeInfo');

  const html = await renderSSRPage({
    c: c,
    title: `Sign in | ${websiteDetails.name}`,
    description: `Sign in | ${websiteDetails.name}`,
    keywords: websiteDetails.metaKeywords?.join(',') || '',
    image: `${process.env.VITE_API_DOMAIN}/img/logo.png`,
    url: `https://` + (websiteDetails.customDomain || websiteDetails.subDomain + `.khudroshop.com`),
    type: 'product',
    bodyContent: `<h1>Sign in to ${websiteDetails.name}</h1>
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
