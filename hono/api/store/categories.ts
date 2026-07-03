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
      const orderBy = desc(Categories['order']);
      const categories = await db.query.Categories.findMany({
        columns: {
          storeId: false,
          createdAt: false,
          updatedAt: false,
          serverId: false,
          isActive: false
        },
        orderBy: [orderBy],
        where: (category, { eq, and }) =>
          and(eq(category.isActive, true), eq(category.storeId, c.var.jwtPayload.storeId))
      });
      // console.log(users);
      return c.json(categories);
    }
  )
  .post('/', sValidator('json', addCategorySchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Categories).values({
      storeId: c.var.jwtPayload.storeId,
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
      .where(
        and(
          eq(Categories.id, Number(c.req.param('id'))),
          eq(Categories.storeId, c.var.jwtPayload.storeId)
        )
      );

    return c.json({ message: 'Category updated successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changeCategoryThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db
      .delete(Categories)
      .where(
        and(
          eq(Categories.id, Number(c.req.param('id'))),
          eq(Categories.storeId, c.var.jwtPayload.storeId)
        )
      );
    return c.json({ message: 'Category deleted successfully!' });
  });
