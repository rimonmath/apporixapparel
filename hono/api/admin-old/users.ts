import { db } from '../../db/index.js';
import { Users } from '../../db/schema.js';
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

export default DashboardApp()
  .get(
    '/',
    sValidator(
      'query',
      paginationSchema.extend({
        s: z.string().max(50).optional(),
        name_like: z.string().max(50).optional(),
        sortDirection: z.enum(['asc', 'desc']).default('asc'),
        sortBy: z.enum(['id', 'name']).default('id')
      })
    ),
    async (c) => {
      const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

      const staticConditions: any = [
        // eq(Users.isDeleted, false),
        // eq(Users.schoolId, c.var.jwtPayload.schoolId)
      ];

      filters.name_like = filters.s;
      // filters.email_like = filters.s;
      // delete filters.s;

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
        where,
        orderBy: [orderBy],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      // console.log(users);
      return c.json({ page, pageSize, total, data: users });
    }
  )
  .post('/', sValidator('json', addUserSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Users).values({
      ...body,
      password: await hashPassword(body.password),
      permissions: [],
      isVerified: true,
      isActive: true
    });

    return c.json({ message: 'User added successfully!' });
  })
  .put('/:id', sValidator('json', editUserSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Users)
      .set({
        ...body
      })
      .where(eq(Users.id, Number(c.req.param('id'))));

    return c.json({ message: 'User updated successfully!' });
  })
  .put('/:id/change-password', sValidator('json', changePasswordSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Users)
      .set({
        password: await hashPassword(body.password)
      })
      .where(eq(Users.id, Number(c.req.param('id'))));

    return c.json({ message: 'Password changed successfully!' });
  })
  .delete('/:id', async (c) => {
    await db.delete(Users).where(eq(Users.id, Number(c.req.param('id'))));
    return c.json({ message: 'User deleted successfully!' });
  });
