import { db } from '../../db/index.js';
import { Pages, StoreSettings, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import { editStoreInfoSchema, saveAppearanceSchema } from '../../utils/zodSchemas.js';
import { addStoreInfo, getStoreInfo } from '../../middleware/storeInfo.js';
import { uploadAndProcess } from '../../middleware/uploadAndProcess.js';
import path from 'node:path';
import fs from 'node:fs';

const STORE_SETTINGS_ID = 2;

export default DashboardApp()
  .put('/appearance', sValidator('json', saveAppearanceSchema), async (c) => {
    const body = c.req.valid('json');

    const [store] = await db
      .update(StoreSettings)
      .set({
        ...body
      })
      .where(eq(StoreSettings.id, STORE_SETTINGS_ID))
      .returning();

    // addStoreInfo(store.subDomain + '.khudroshop.com', { ...store, storeId: store.id });

    return c.json({ message: 'Appearance updated successfully!' });
  })
  .put('/store-info', sValidator('json', editStoreInfoSchema), async (c) => {
    const body = c.req.valid('json');

    const [store] = await db
      .update(StoreSettings)
      .set({
        ...body
      })
      .where(eq(StoreSettings.id, STORE_SETTINGS_ID))
      .returning();

    // addStoreInfo(store.subDomain + '.khudroshop.com', { ...store, storeId: store.id });

    return c.json({ message: 'Store Info updated successfully!' });
  })
  .put(
    '/update-logo',
    uploadAndProcess({
      fieldName: 'web-logo',
      maxSize: 8_000_000,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      resize: { height: 50 },
      convertToJpeg: false
    }),
    async (c) => {
      const uploaded = c.get('uploadedFile');

      const url = uploaded.path.substring(7, uploaded.path.length);
      const currentLogo = getStoreInfo(
        c.var.jwtPayload.storeSubDomain + '.khudroshop.com'
      )?.logoUrl;
      // console.log(getStoreInfo(c.var.jwtPayload.storeSubDomain + '.khudroshop.com'));

      if (currentLogo) {
        try {
          const filePath = path.join('uploads', currentLogo);

          fs.unlink(filePath, async (err) => {
            if (err) {
              console.log(err);
              // throw new Error('Could not delete photo!');
            }
          });
        } catch (error) {
          console.log(error);
        }
      }

      const [store] = await db
        .update(StoreSettings)
        .set({
          logoUrl: url
        })
        .where(eq(StoreSettings.id, STORE_SETTINGS_ID))
        .returning();

      // addStoreInfo(store.subDomain + '.khudroshop.com', { ...store, storeId: store.id });

      return c.json({
        message: 'Logo updated successfully!'
      });
    }
  )
  .put(
    '/update-favicon',
    uploadAndProcess({
      fieldName: 'favicon',
      maxSize: 8_000_000,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'ico'],
      resize: { height: 32, width: 32 },
      convertToJpeg: false
    }),
    async (c) => {
      const uploaded = c.get('uploadedFile');

      const url = uploaded.path.substring(7, uploaded.path.length);
      const currentFavicon = getStoreInfo(
        c.var.jwtPayload.storeSubDomain + '.khudroshop.com'
      )?.faviconUrl;
      // console.log(getStoreInfo(c.var.jwtPayload.storeSubDomain + '.khudroshop.com'));

      if (currentFavicon) {
        try {
          const filePath = path.join('uploads', currentFavicon);

          fs.unlink(filePath, async (err) => {
            if (err) {
              console.log(err);
              // throw new Error('Could not delete photo!');
            }
          });
        } catch (error) {
          console.log(error);
        }
      }

      const [store] = await db
        .update(StoreSettings)
        .set({
          faviconUrl: url
        })
        .where(eq(StoreSettings.id, STORE_SETTINGS_ID))
        .returning();

      // addStoreInfo(store.subDomain + '.khudroshop.com', { ...store, storeId: store.id });

      return c.json({
        message: 'Favicon updated successfully!'
      });
    }
  );
