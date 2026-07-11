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
  addUserSchema,
  changePasswordSchema,
  editCategorySchema,
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
        orderNumber_startsWith: z.string().max(50).optional(),
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
  });
