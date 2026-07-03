import { db } from '../../db/index.js';
import { Pages, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import { addPageSchema } from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const pages = await db.query.Pages.findMany({
        where: (page, { and, eq }) =>
          and(eq(page.isPublished, true), eq(page.storeId, c.var.jwtPayload.storeId)),
        orderBy: (attributes, { asc }) => [asc(attributes.id)]
      });
      // console.log(users);
      return c.json(pages);
    }
  )
  .post('/', sValidator('json', addPageSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Pages).values({
      ...body,
      storeId: c.var.jwtPayload.storeId
    });

    return c.json({ message: 'Page added successfully!' });
  })
  .put('/:id', sValidator('json', addPageSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Pages)
      .set({
        ...body,
        storeId: c.var.jwtPayload.storeId
      })
      .where(
        and(eq(Pages.id, Number(c.req.param('id'))), eq(Pages.storeId, c.var.jwtPayload.storeId))
      );

    return c.json({ message: 'Page updated successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changePageThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db
      .delete(Pages)
      .where(
        and(eq(Pages.id, Number(c.req.param('id'))), eq(Pages.storeId, c.var.jwtPayload.storeId))
      );
    return c.json({ message: 'Page deleted successfully!' });
  });
