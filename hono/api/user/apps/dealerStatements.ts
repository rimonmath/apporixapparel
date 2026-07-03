import { sValidator } from '@hono/standard-validator';
import { db } from '../../../db/index.js';
import { DashboardApp } from '../../../utils/functions.js';
import { Dealers, DealerStatements, DSArchives } from '../../../db/schema.js';
import { and, asc, desc, eq } from 'drizzle-orm';
import {
  addDealerSchema,
  addDealerStatementSchema,
  addDSArchiveSchema
} from '../../../utils/zodSchemas.js';

export default DashboardApp()
  .post('/', sValidator('json', addDealerStatementSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(DealerStatements).values({
      ...body,
      userId: c.var.jwtPayload.userId
    });

    return c.json({ message: 'Statement added successfully!' });
  })
  .get('/', async (c) => {
    const orderBy = asc(DealerStatements.id);
    const dealerId = Number(c.req.query('dealerId_eq')) || 1;

    const dealerStatements = await db.query.DealerStatements.findMany({
      with: {
        dealer: {
          columns: {
            name: true,
            id: true
          }
        }
      },
      where: (fields, { and, eq }) =>
        and(eq(fields.userId, c.var.jwtPayload.userId), eq(fields.dealerId, dealerId)),
      orderBy
    });
    return c.json(dealerStatements);
  })
  .put('/:id', sValidator('json', addDealerStatementSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(DealerStatements)
      .set({ ...body })
      .where(
        and(
          eq(DealerStatements.id, Number(c.req.param('id'))),
          eq(DealerStatements.userId, c.var.jwtPayload.userId)
        )
      );

    return c.json({ message: 'Statement updated successfully!' });
  })
  .get(
    '/dealers',

    async (c) => {
      const orderBy = desc(Dealers.id);

      const dealers = await db.query.Dealers.findMany({
        where: (fields, { and, eq }) => and(eq(fields.userId, c.var.jwtPayload.userId)),
        orderBy
      });
      return c.json(dealers);
    }
  )
  .post('/dealers', sValidator('json', addDealerSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Dealers).values({
      userId: c.var.jwtPayload.userId,
      ...body
    });

    return c.json({ message: 'Dealer added successfully!' });
  })
  .put('/dealers/:id', sValidator('json', addDealerSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Dealers)
      .set({ ...body })
      .where(
        and(eq(Dealers.id, Number(c.req.param('id'))), eq(Dealers.userId, c.var.jwtPayload.userId))
      );

    return c.json({ message: 'Dealer updated successfully!' });
  })
  .delete('/dealers/:id', async (c) => {
    const id = c.req.param('id');

    await db
      .delete(Dealers)
      .where(and(eq(Dealers.id, Number(id)), eq(Dealers.userId, c.var.jwtPayload.userId)));

    return c.json({ message: 'Dealer deleted successfully!' });
  })
  .get('/archives', async (c) => {
    const orderBy = desc(DSArchives.id);

    const archives = await db.query.DSArchives.findMany({
      columns: {
        data: false
      },
      where: (fields, { and, eq }) => and(eq(fields.userId, c.var.jwtPayload.userId)),
      orderBy
    });
    return c.json(archives);
  })
  .get('/archives/:id', async (c) => {
    const id = c.req.param('id');

    const details = await db.query.DSArchives.findFirst({
      where: (fields, { and, eq }) =>
        and(eq(fields.id, Number(id)), eq(fields.userId, c.var.jwtPayload.userId))
    });
    return c.json(details);
  })
  .post('/archives', sValidator('json', addDSArchiveSchema), async (c) => {
    const body = c.req.valid('json');

    await db.transaction(async (trx) => {
      await trx.insert(DSArchives).values({
        userId: c.var.jwtPayload.userId,
        ...body
      });

      await trx
        .delete(DealerStatements)
        .where(
          and(
            eq(DealerStatements.dealerId, body.dealerId),
            eq(DealerStatements.userId, c.var.jwtPayload.userId)
          )
        );
    });

    return c.json({ message: 'Archived successfully!' });
  })
  .delete('/archives/:id', async (c) => {
    const id = c.req.param('id');

    await db
      .delete(DSArchives)
      .where(and(eq(DSArchives.id, Number(id)), eq(DSArchives.userId, c.var.jwtPayload.userId)));

    return c.json({ message: 'Statement deleted successfully!' });
  });
