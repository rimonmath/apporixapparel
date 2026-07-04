import { db } from '../../db/index.js';
import { Coupons, DeliveryOptions } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
import { eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';
import { addEditCouponSchema } from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get('/', async (c) => {
    const coupons = await db.query.Coupons.findMany({
      columns: {
        createdAt: false,
        updatedAt: false
      }
    });
    // console.log(products);
    return c.json(coupons);
  })
  .post('/', sValidator('json', addEditCouponSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(Coupons).values({
      ...body,
      discount: body.discount?.toString() || '0.00',
      minPurchase: body.minPurchase?.toString() || '0.00',
      maxDiscount: body.maxDiscount?.toString() || '0.00'
    });

    return c.json({ message: 'Coupon added successfully!' });
  })
  .put('/:id', sValidator('json', addEditCouponSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Coupons)
      .set({
        ...body,
        discount: body.discount?.toString() || '0.00',
        minPurchase: body.minPurchase?.toString() || '0.00',
        maxDiscount: body.maxDiscount?.toString() || '0.00'
      })
      .where(eq(Coupons.id, Number(c.req.param('id'))));

    return c.json({ message: 'Coupon updated successfully!' });
  })
  .delete('/:id', async (c) => {
    await db.delete(Coupons).where(eq(Coupons.id, Number(c.req.param('id'))));
    return c.json({ message: 'Coupon deleted successfully!' });
  });
