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
      .from(Users)
      .where(where);
    const total = Number(totalResult[0]?.count ?? 0);

    // Dynamic sorting
    const orderBy = sortDirection === 'asc' ? asc(Users[sortBy]) : desc(Users[sortBy]);

    const users = await db.query.Users.findMany({
      columns: {
        password: false
      },
      with: {},
      where,
      orderBy: [orderBy],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    // console.log(products);
    return c.json({ page, pageSize, total, data: users });
  }
);
