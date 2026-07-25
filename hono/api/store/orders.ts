import { db } from '../../db/index.js';
import { Categories, Orders, OrderStatusHistory, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import {
  addCategorySchema,
  addNextStepSchema,
  addPaymentHistorySchema,
  addUserSchema,
  changePasswordSchema,
  editCategorySchema,
  editPaymentHistorySchema,
  editUserSchema,
  paginationSchema
} from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/',
    sValidator(
      'query',
      paginationSchema.extend({
        orderStatus_eq: z.string().max(50).optional(),
        id_eq: z.string().max(50).optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        sortBy: z.enum(['id']).default('id')
      })
    ),
    async (c) => {
      const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

      const staticConditions: any = [
        // eq(Orders.storeId, c.var.jwtPayload.storeId)
        // eq(Products.schoolId, c.var.jwtPayload.schoolId)
      ];

      const filterConditions = generateFilterConditions(filters, Orders);
      const where = and(...staticConditions, ...filterConditions);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(Orders)
        .where(where);
      const total = Number(totalResult[0]?.count ?? 0);

      // Dynamic sorting
      const orderBy = sortDirection === 'asc' ? asc(Orders[sortBy]) : desc(Orders[sortBy]);

      const orders = await db.query.Orders.findMany({
        with: {
          user: {
            columns: {
              id: true,
              name: true
            }
          },
          orderItems: {
            columns: {
              createdAt: false,
              updatedAt: false,
              id: false
            },
            with: {
              product: {
                columns: {
                  id: true,
                  title: true
                },
                with: {
                  images: {
                    columns: {
                      url: true
                    },
                    limit: 1
                  }
                }
              }
            }
          }
        },

        where,
        orderBy: [orderBy],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      // console.log(products);
      return c.json({ page, pageSize, total, data: orders });
    }
  )
  .get('/count', async (c) => {
    const result = await db.execute(
      sql`
        SELECT order_status, COUNT(*) AS count
        FROM orders
        GROUP BY order_status
      `
    );

    // result is an array, no .rows needed
    const counts: Record<string, number> = { All: 0 };
    let total = 0;

    for (const row of result as any) {
      counts[row.order_status] = Number(row.count);
      total += Number(row.count);
    }

    counts.All = total;

    return c.json(counts);
  })
  .get('/:id', async (c) => {
    const order = await db.query.Orders.findFirst({
      columns: {
        adminNote: false,
        userId: false
      },
      with: {
        orderItems: {
          columns: {
            createdAt: false,
            updatedAt: false,
            id: false
          },
          with: {
            product: {
              columns: {
                id: true,
                title: true
              },
              with: {
                images: {
                  columns: {
                    url: true
                  },
                  limit: 1
                }
              }
            }
          }
        },
        coupon: {
          columns: {
            id: true,
            code: true,
            discount: true,
            type: true,
            maxDiscount: true
          }
        },
        shippingAddress: {
          columns: {
            id: true,
            name: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            country: true,
            postalCode: true,
            phone: true
          }
        },
        orderStatusHistory: {
          columns: {
            id: true,
            status: true,
            note: true,
            createdAt: true
          }
        }
      },
      where: (fields, { eq, and }) => eq(fields.id, Number(c.req.param('id')))
    });
    // console.log(products);
    return c.json(order);
  })
  .post('/:id/add-next-step', sValidator('json', addNextStepSchema), async (c) => {
    const body = c.req.valid('json');

    await db.transaction(async (tx) => {
      await tx.insert(OrderStatusHistory).values({
        ...body,
        orderId: Number(c.req.param('id')),
        updatedBy: c.var.jwtPayload.userId
      });

      await tx
        .update(Orders)
        .set({
          orderStatus: body.status
        })
        .where(eq(Orders.id, Number(c.req.param('id'))));
    });

    return c.json({ message: 'Order updated successfully!' });
  })
  .post('/:id/add-payment-history', sValidator('json', addPaymentHistorySchema), async (c) => {
    const body = c.req.valid('json');

    const result = await db
      .update(Orders)
      .set({
        paymentStatus: body.paymentStatus,
        paymentHistory: sql`${Orders.paymentHistory} || ${JSON.stringify([{ ...body, createdAt: new Date().toISOString(), createdBy: c.var.jwtPayload.userId }])}::jsonb`
      })
      .where(eq(Orders.id, Number(c.req.param('id'))));
    // console.log(result);

    return c.json({ message: 'Payment history added successfully!' });
  })
  .put('/:id/save-payment-history', sValidator('json', editPaymentHistorySchema), async (c) => {
    const body = c.req.valid('json');
    const formattedBody = body.map((item) => ({
      ...item,
      createdBy: c.var.jwtPayload.userId,
      createdAt: new Date().toISOString()
    }));

    await db
      .update(Orders)
      .set({
        paymentHistory: formattedBody
      })
      .where(eq(Orders.id, Number(c.req.param('id'))));
    // console.log(result);

    return c.json({ message: 'Payment history updated successfully!' });
  });
