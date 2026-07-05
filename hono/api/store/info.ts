import { db } from '../../db/index.js';
import { Categories, Orders, ProductImages, Products, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import {
  addUserSchema,
  changePasswordSchema,
  editUserSchema,
  paginationSchema
} from '../../utils/zodSchemas.js';

export default DashboardApp().get(
  '/',

  async function handler(c) {
    const storeInfo = await db.query.StoreSettings.findFirst({
      where: (fields, { eq }) => eq(fields.id, 2),

      extras: () => ({
        categoryCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${Categories}
    )
  `.as('category_count'),

        productCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${Products}
    )
  `.as('product_count'),

        totalOrdersCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${Orders}
    )
  `.as('total_orders_count'),

        thisMonthOrdersCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${Orders} o
      WHERE DATE_TRUNC('month', o.created_at) =
            DATE_TRUNC('month', NOW())
    )
  `.as('this_month_orders_count'),

        totalProductImagesCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${ProductImages} pi
      JOIN ${Products} p
        ON pi.product_id = p.id
    )
  `.as('total_product_images_count')
      })
    });

    console.log(storeInfo);

    return c.json(storeInfo);
  }
);
