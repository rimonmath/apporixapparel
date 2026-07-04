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
        // where: (page, { eq }) => eq(page.isPublished, true),
        orderBy: (attributes, { asc }) => [asc(attributes.id)]
      });
      // console.log(users);
      return c.json(pages);
    }
  )
  .post('/', sValidator('json', addPageSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Pages).values({
      ...body
    });

    return c.json({ message: 'Page added successfully!' });
  })
  .put('/:id', sValidator('json', addPageSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Pages)
      .set({
        ...body
      })
      .where(eq(Pages.id, Number(c.req.param('id'))));

    return c.json({ message: 'Page updated successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changePageThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db.delete(Pages).where(eq(Pages.id, Number(c.req.param('id'))));
    return c.json({ message: 'Page deleted successfully!' });
  });
