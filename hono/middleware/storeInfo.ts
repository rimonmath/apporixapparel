import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import 'dotenv/config';
import { db } from '../db';
import type { StoreInfo } from '../utils/node-types';
import { Context } from 'hono';

const storesMap: Record<string, StoreInfo> = {
  'khudroshop.com': {
    storeId: 0,
    serverId: 0,
    packageExpiry: '',
    name: 'Khudroshop',
    subDomain: '',
    customDomain: null,
    metaTitle:
      'Khudroshop, Empowering small businesses with simple, powerful tools to manage their online presence.',
    metaDescription: 'KhudroShop is a platform for artisans to sell their products online.',
    metaKeywords: [
      'website',
      'app',
      'store builder',
      'shop',
      'shop builder',
      'bangla',
      'bangladesh'
    ],
    logoUrl: '/img/logo.png',
    brandColor: '#00ae64',
    faviconUrl: '/favicon.png',
    currency: '',
    timezone: '',
    status: ''
  },
  'localhost:5123': {
    storeId: 0,
    serverId: 0,
    packageExpiry: '',
    name: 'Khudroshop',
    subDomain: '',
    customDomain: null,
    metaTitle:
      'Khudroshop, Empowering small businesses with simple, powerful tools to manage their online presence.',
    metaDescription: 'KhudroShop is a platform for artisans to sell their products online.',
    metaKeywords: [
      'website',
      'app',
      'store builder',
      'shop',
      'shop builder',
      'bangla',
      'bangladesh'
    ],
    logoUrl: '/img/logo.png',
    brandColor: '#00ae64',
    faviconUrl: '/favicon.png',
    currency: '',
    timezone: '',
    status: ''
  },
  'localhost:3123': {
    storeId: 0,
    serverId: 0,
    packageExpiry: '',
    name: 'Khudroshop',
    subDomain: '',
    customDomain: null,
    metaTitle:
      'Khudroshop, Empowering small businesses with simple, powerful tools to manage their online presence.',
    metaDescription: 'KhudroShop is a platform for artisans to sell their products online.',
    metaKeywords: [
      'website',
      'app',
      'store builder',
      'shop',
      'shop builder',
      'bangla',
      'bangladesh'
    ],
    logoUrl: '/img/logo.png',
    brandColor: '#00ae64',
    faviconUrl: '/favicon.png',
    currency: '',
    timezone: '',
    status: ''
  }
};

export const addStoreInfo = (subDomain: string, storeInfo: StoreInfo) => {
  storesMap[subDomain] = storeInfo;
  if (storeInfo.customDomain) {
    storesMap[storeInfo.customDomain] = storeInfo;
  }
};

export const initStores = async () => {
  const stores = await db.query.StoreSettings.findMany({
    // where: (fields, { eq }) => eq(fields.status, 'Published')
  });

  stores.forEach((store) => {
    const storeInfo = {
      ...store
    };

    // addStoreInfo(store.subDomain + '.khudroshop.com', storeInfo);

    // TODO: remove this line in production
    // addStoreInfo(store.subDomain + '.localhost:3123', storeInfo);
    // addStoreInfo(store.subDomain + '.localhost:5123', storeInfo);
  });
};

// initStores();

function getBaseHost(c: Context): string {
  const origin = c.req.header('origin');

  if (origin) {
    return new URL(origin).host; // ✅ removes http/https automatically
  }

  // fallback when Origin is missing
  return c.req.header('host') ?? '';
}

export const getStoreInfo = (host: string): StoreInfo | null => {
  return storesMap[host];
};

export const storeInfoMiddleware = createMiddleware<{
  Variables: { storeInfo: StoreInfo | null };
}>(async (c, next) => {
  const host = getBaseHost(c);

  // console.log(host);
  // console.log(storesMap);
  // return c.json(host);
  // return c.json(storesMap);

  if (!host) {
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  const storeInfo = getStoreInfo(host);

  if (!storeInfo) {
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  c.set('storeInfo', storeInfo);

  await next();
});
