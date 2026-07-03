import { db } from '../../db/index.js';
import { Attributes, AttributeValues, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions, hashPassword } from '../../utils/functions.js';
import z from 'zod';
import {
  addAttributeSchema,
  addAttributeValueSchema,
  editAttributeSchema
} from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const attributes = await db.query.Attributes.findMany({
        // where: (attribute, { eq }) => eq(attribute.isActive, true)
        with: {
          attributeValues: true
        },
        orderBy: (attributes, { asc }) => [asc(attributes.id)]
      });
      // console.log(users);
      return c.json(attributes);
    }
  )
  .post('/', sValidator('json', addAttributeSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Attributes).values({
      ...body
    });

    return c.json({ message: 'Attribute added successfully!' });
  })
  .put('/:id', sValidator('json', editAttributeSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Attributes)
      .set({
        ...body
      })
      .where(eq(Attributes.id, Number(c.req.param('id'))));

    return c.json({ message: 'Attribute updated successfully!' });
  })
  .post('/:id/values', sValidator('json', addAttributeValueSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(AttributeValues).values({
      attributeId: Number(c.req.param('id')),
      ...body
    });

    return c.json({ message: 'Attribute value added successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changeAttributeThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db.delete(Attributes).where(eq(Attributes.id, Number(c.req.param('id'))));
    return c.json({ message: 'Attribute deleted successfully!' });
  })
  .delete('/:id/values/:valueId', async (c) => {
    await db.delete(AttributeValues).where(eq(AttributeValues.id, Number(c.req.param('valueId'))));
    return c.json({ message: 'Attribute value deleted successfully!' });
  });
