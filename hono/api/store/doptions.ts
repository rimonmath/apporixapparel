import { db } from '../../db/index.js';
import { DeliveryOptions } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
import { eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';
import { addEditDeliveryOptionSchema } from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const deliveryOptions = await db.query.DeliveryOptions.findMany({
        columns: {
          storeId: false,
          createdAt: false,
          updatedAt: false
        },
        where: (deliveryOption, { eq }) => eq(deliveryOption.storeId, c.var.jwtPayload.storeId)
      });
      // console.log(products);
      return c.json(deliveryOptions);
    }
  )
  .post('/', sValidator('json', addEditDeliveryOptionSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(DeliveryOptions).values({
      ...body,
      charge: body.charge.toString(),
      weightLimit: body.weightLimit.toString(),
      storeId: c.var.jwtPayload.storeId
    });

    return c.json({ message: 'Delivery option added successfully!' });
  })
  .put('/:id', sValidator('json', addEditDeliveryOptionSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(DeliveryOptions)
      .set({
        ...body,
        charge: body.charge.toString(),
        weightLimit: body.weightLimit.toString()
      })
      .where(eq(DeliveryOptions.id, Number(c.req.param('id'))));

    return c.json({ message: 'Delivery option updated successfully!' });
  })
  .delete('/:id', async (c) => {
    await db.delete(DeliveryOptions).where(eq(DeliveryOptions.id, Number(c.req.param('id'))));
    return c.json({ message: 'Delivery option deleted successfully!' });
  });
