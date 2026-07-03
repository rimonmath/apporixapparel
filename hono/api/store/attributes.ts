import { db } from '../../db/index.js';
import { Attributes, AttributeValues } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';
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
        where: (attribute, { eq }) => eq(attribute.storeId, c.var.jwtPayload.storeId),
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
      ...body,
      storeId: c.var.jwtPayload.storeId
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
      .where(
        and(
          eq(Attributes.id, Number(c.req.param('id'))),
          eq(Attributes.storeId, c.var.jwtPayload.storeId)
        )
      );

    return c.json({ message: 'Attribute updated successfully!' });
  })
  .post('/:id/values', sValidator('json', addAttributeValueSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(AttributeValues).values({
      attributeId: Number(c.req.param('id')),
      storeId: c.var.jwtPayload.storeId,
      ...body
    });

    return c.json({ message: 'Attribute value added successfully!' });
  })
  // .put('/:id/change-thumbnail', sValidator('json', changeAttributeThumbnail), async (c) => {

  // })
  .delete('/:id', async (c) => {
    await db
      .delete(Attributes)
      .where(
        and(
          eq(Attributes.id, Number(c.req.param('id'))),
          eq(Attributes.storeId, c.var.jwtPayload.storeId)
        )
      );
    return c.json({ message: 'Attribute deleted successfully!' });
  })
  .delete('/:id/values/:valueId', async (c) => {
    await db
      .delete(AttributeValues)
      .where(
        and(
          eq(AttributeValues.id, Number(c.req.param('valueId'))),
          eq(AttributeValues.storeId, c.var.jwtPayload.storeId)
        )
      );
    return c.json({ message: 'Attribute value deleted successfully!' });
  });
