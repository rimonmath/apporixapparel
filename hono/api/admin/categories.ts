import { db } from '../../db/index.js';
import { Categories, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import {
  addCategorySchema,
  addUserSchema,
  changePasswordSchema,
  editCategorySchema,
  editUserSchema,
  paginationSchema
} from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const categories = await db.query.Categories.findMany({
        where: (category, { eq }) => eq(category.isActive, true)
      });
      // console.log(users);
      return c.json(categories);
    }
  )
  .post('/', sValidator('json', addCategorySchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Categories).values({
      ...body
    });

    return c.json({ message: 'Category added successfully!' });
  })
  .put('/:id', sValidator('json', editCategorySchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Categories)
      .set({
        ...body
      })
      .where(eq(Categories.id, Number(c.req.param('id'))));

    return c.json({ message: 'Category updated successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changeCategoryThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db.delete(Categories).where(eq(Categories.id, Number(c.req.param('id'))));
    return c.json({ message: 'Category deleted successfully!' });
  });
