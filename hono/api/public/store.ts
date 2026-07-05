import { db } from '../../db/index.js';
import { Pages, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import { addPageSchema } from '../../utils/zodSchemas.js';

const STORE_SETTING_ID = 2;

export default DashboardApp().get(
  '/details',

  async (c) => {
    const storeDetails = await db.query.StoreSettings.findFirst({
      columns: {
        name: true,
        brandColor: true,
        logoUrl: true,
        showNextToLogo: true,
        faviconUrl: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        address: true,
        supportEmail: true,
        supportPhone: true,
        facebook: true,
        instagram: true,
        whatsapp: true,
        youtube: true
      },
      where: (fields, { eq }) => eq(fields.id, STORE_SETTING_ID)
    });
    // console.log(users);
    return c.json(storeDetails);
  }
);
