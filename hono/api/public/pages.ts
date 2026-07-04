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
        columns: {
          createdAt: false,
          updatedAt: false,
          isPublished: false,
          description: false
        },
        where: (fields, { eq, and }) => eq(fields.isPublished, true),
        orderBy: (attributes, { asc }) => [asc(attributes.id)]
      });
      // console.log(users);
      return c.json(pages);
    }
  )
  .get('/:id', async (c) => {
    const pages = await db.query.Pages.findFirst({
      columns: {
        createdAt: false,
        updatedAt: false,
        isPublished: false
      },
      where: (fields, { eq, and }) =>
        and(eq(fields.isPublished, true), eq(fields.id, Number(c.req.param('id'))))
    });
    // console.log(users);
    return c.json(pages);
  });
