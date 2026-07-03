import { db } from '../../db/index.js';
import { Categories, Orders, ProductImages, Products, Stores, Users } from '../../db/schema.js';
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
  sValidator(
    'query',
    paginationSchema.extend({
      s: z.string().max(50).optional(),
      name_like: z.string().max(50).optional(),
      sortDirection: z.enum(['asc', 'desc']).default('desc'),
      sortBy: z.enum(['id', 'name']).default('id')
    })
  ),
  async (c) => {
    const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

    const staticConditions: any = [
      /*eq(Users.storeId, c.var.jwtPayload.storeId)*/
    ];

    const filterConditions = generateFilterConditions(filters, Users);
    const where = and(...staticConditions, ...filterConditions);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(Stores)
      .where(where);
    const total = Number(totalResult[0]?.count ?? 0);

    // Dynamic sorting
    const orderBy = sortDirection === 'asc' ? asc(Stores[sortBy]) : desc(Stores[sortBy]);

    const stores = await db.query.Stores.findMany({
      // columns: {
      //   // password: false
      // },
      with: {
        user: {
          columns: {
            id: true,
            name: true
          }
        },
        package: {
          columns: {
            id: true,
            name: true,
            monthlyOrdersLimit: true
          }
        }
      },
      where,
      orderBy: [orderBy],
      limit: pageSize,
      offset: (page - 1) * pageSize,
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
            `.as('this_month_orders_count')

        // // Total product images
        // totalProductImagesCount: sql<number>`
        //       (SELECT COUNT(*)
        //        FROM ${ProductImages} pi
        //        JOIN ${Products} p ON pi.product_id = p.id
        //        WHERE p.store_id = ${fields.id})
        //     `.as('total_product_images_count')
      })
    });
    // console.log(products);
    return c.json({ page, pageSize, total, data: stores });
  }
);
