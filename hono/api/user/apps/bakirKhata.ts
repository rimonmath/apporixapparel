import { sValidator } from '@hono/standard-validator';
import { db } from '../../../db/index.js';
import { DashboardApp, generateFilterConditions } from '../../../utils/functions.js';
import {
  addBakirKhataItemSchema,
  paginationSchema,
  updateReturnsSchema
} from '../../../utils/zodSchemas.js';
import { Dues } from '../../../db/schema.js';
import z from 'zod';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { c } from 'naive-ui';

export default DashboardApp()
  .get(
    '/',
    sValidator(
      'query',
      paginationSchema.extend({
        s: z.string().max(50).optional(),
        customerName_like: z.string().max(50).optional(),
        entryDate_gte: z.string().optional(),
        entryDate_lte: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        sortBy: z.enum(['id', 'entryDate']).default('entryDate')
      })
    ),
    async (c) => {
      const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

      if (!filters.entryDate_gte && !filters.entryDate_lte) {
        filters.customerName_like = filters.s;
      }

      const staticConditions: any = [eq(Dues.userId, c.var.jwtPayload.userId)];

      const filterConditions = generateFilterConditions(filters, Dues);
      const where = and(...staticConditions, ...filterConditions);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(Dues)
        .where(where);
      const total = Number(totalResult[0]?.count ?? 0);

      // Dynamic sorting
      const orderBy = sortDirection === 'asc' ? asc(Dues[sortBy]) : desc(Dues[sortBy]);

      const bakis = await db.query.Dues.findMany({
        where,
        orderBy: [orderBy],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      return c.json({ page, pageSize, total, data: bakis });
    }
  )
  .get(
    '/stats',

    async (c) => {
      const result = await db
        .select({
          totalAmount: sql<string>`SUM(${Dues.amount})`,
          totalReturns: sql<string>`SUM(${Dues.totalReturns})`
        })
        .from(Dues)
        .where(eq(Dues.userId, c.var.jwtPayload.userId));
      return c.json(result[0]);
    }
  )
  .post('/', sValidator('json', addBakirKhataItemSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Dues).values({
      userId: c.var.jwtPayload.userId,
      ...body
    });

    return c.json({ message: 'Item added successfully!' });
  })
  .put('/:id', sValidator('json', addBakirKhataItemSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Dues)
      .set({ ...body })
      .where(and(eq(Dues.id, Number(c.req.param('id'))), eq(Dues.userId, c.var.jwtPayload.userId)));

    return c.json({ message: 'Item updated successfully!' });
  })

  .put('/:id/returns', sValidator('json', updateReturnsSchema), async (c) => {
    const body = c.req.valid('json');
    const totalReturns = body.returns.reduce((acc, cur) => acc + Number(cur.returnAmount), 0);

    await db
      .update(Dues)
      .set({ ...body, totalReturns: totalReturns.toFixed(2) })
      .where(and(eq(Dues.id, Number(c.req.param('id'))), eq(Dues.userId, c.var.jwtPayload.userId)));

    return c.json({ message: 'Returns updated successfully!' });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    await db
      .delete(Dues)
      .where(and(eq(Dues.id, Number(id)), eq(Dues.userId, c.var.jwtPayload.userId)));

    return c.json({ message: 'Item deleted successfully!' });
  });
