import { sValidator } from '@hono/standard-validator';
import { db } from '../../../db/index.js';
import { DashboardApp, generateFilterConditions } from '../../../utils/functions.js';
import { addIncomeExpenseSchema, paginationSchema } from '../../../utils/zodSchemas.js';
import { IncomeExpenses } from '../../../db/schema.js';
import z from 'zod';
import { and, asc, desc, eq, sql } from 'drizzle-orm';

export default DashboardApp()
  .get(
    '/',
    sValidator(
      'query',
      paginationSchema.extend({
        s: z.string().max(50).optional(),
        note_like: z.string().max(50).optional(),
        entryDate_gte: z.string().optional(),
        entryDate_lte: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        sortBy: z.enum(['id', 'entryDate']).default('entryDate')
      })
    ),
    async (c) => {
      const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

      if (!filters.entryDate_gte && !filters.entryDate_lte) {
        filters.note_like = filters.s;
      }

      const staticConditions: any = [eq(IncomeExpenses.userId, c.var.jwtPayload.userId)];

      const filterConditions = generateFilterConditions(filters, IncomeExpenses);
      const where = and(...staticConditions, ...filterConditions);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(IncomeExpenses)
        .where(where);
      const total = Number(totalResult[0]?.count ?? 0);

      // Dynamic sorting
      const orderBy =
        sortDirection === 'asc' ? asc(IncomeExpenses[sortBy]) : desc(IncomeExpenses[sortBy]);

      const data = await db.query.IncomeExpenses.findMany({
        where,
        orderBy: [orderBy],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      return c.json({ page, pageSize, total, data });
    }
  )
  .get(
    '/stats',

    async (c) => {
      const result = await db
        .select({
          totalIncome: sql<string>`
      COALESCE(
        SUM(CASE WHEN ${IncomeExpenses.type} = 'Income'
          THEN ${IncomeExpenses.amount}
          ELSE 0
        END),
        0
      )
    `,
          totalExpense: sql<string>`
      COALESCE(
        SUM(CASE WHEN ${IncomeExpenses.type} = 'Expense'
          THEN ${IncomeExpenses.amount}
          ELSE 0
        END),
        0
      )
    `
        })
        .from(IncomeExpenses)
        .where(eq(IncomeExpenses.userId, c.var.jwtPayload.userId));

      return c.json(result[0]);
    }
  )
  .post('/', sValidator('json', addIncomeExpenseSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(IncomeExpenses).values({
      userId: c.var.jwtPayload.userId,
      ...body
    });

    return c.json({ message: 'Item added successfully!' });
  })
  .put('/:id', sValidator('json', addIncomeExpenseSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(IncomeExpenses)
      .set({ ...body })
      .where(
        and(
          eq(IncomeExpenses.id, Number(c.req.param('id'))),
          eq(IncomeExpenses.userId, c.var.jwtPayload.userId)
        )
      );

    return c.json({ message: 'Item updated successfully!' });
  })

  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    await db
      .delete(IncomeExpenses)
      .where(
        and(eq(IncomeExpenses.id, Number(id)), eq(IncomeExpenses.userId, c.var.jwtPayload.userId))
      );

    return c.json({ message: 'Item deleted successfully!' });
  });
