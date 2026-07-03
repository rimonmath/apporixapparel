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
    const subDomain = c.req.param('subDomain') || '';

    const storeInfo = await db.query.Stores.findFirst({
      where: (fields, { eq }) => eq(fields.subDomain, subDomain),

      with: {
        package: true
      },

      extras: (fields) => ({
        // Total categories
        categoryCount: sql<number>`
        (SELECT COUNT(*) FROM ${Categories} c WHERE c.store_id = ${fields.id})
      `.as('category_count'),

        // Total products
        productCount: sql<number>`
        (SELECT COUNT(*) FROM ${Products} p WHERE p.store_id = ${fields.id})
      `.as('product_count'),

        // Total orders
        totalOrdersCount: sql<number>`
        (SELECT COUNT(*) FROM ${Orders} o WHERE o.store_id = ${fields.id})
      `.as('total_orders_count'),

        // This month's orders
        thisMonthOrdersCount: sql<number>`
        (SELECT COUNT(*) FROM ${Orders} o 
         WHERE o.store_id = ${fields.id}
           AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())
        )
      `.as('this_month_orders_count'),

        // Total product images
        totalProductImagesCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${ProductImages} pi 
         JOIN ${Products} p ON pi.product_id = p.id
         WHERE p.store_id = ${fields.id})
      `.as('total_product_images_count')
      })
    });

    return c.json(storeInfo);
  }
);
