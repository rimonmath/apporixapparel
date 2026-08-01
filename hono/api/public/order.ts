import { db } from '../../db/index.js';
import { DeliveryOptions, OrderItems, Orders, OrderStatusHistory } from '../../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';
import { sValidator } from '@hono/standard-validator';
import { placeOrderSchema } from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get(
    '/delivery-options',

    async (c) => {
      const items = await db.query.DeliveryOptions.findMany({
        columns: {
          createdAt: false,
          updatedAt: false
        }
      });
      return c.json(items);
    }
  )
  .post('/', sValidator('json', placeOrderSchema), async (c) => {
    const body = c.req.valid('json');

    if (body.paymentMethod !== 'Cash On Delivery') {
      throw new Error('Only Cash On Delivery is supported now');
    }

    // TODO: Get Products with variants
    const productIds = body.cartItems.map((item) => item.productId);

    const products = await db.query.Products.findMany({
      with: {
        pricings: true
      },
      where: (fields, { and, eq, inArray }) =>
        and(inArray(fields.id, productIds), eq(fields.status, 'Published'))
    });

    const productsMap = products.reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<number, any>
    );

    // TODO: Calculate Total Price with matched variants

    const subtotal = body.cartItems.reduce((acc, item) => {
      const product = productsMap[item.productId];
      const pricing = product.pricings.find((v: any) => v.variation === item.variation);
      if (!pricing) {
        throw new Error('Pricing not found');
      }
      return acc + Number(pricing?.salePrice) * item.quantity;
    }, 0);

    if (subtotal !== body.subtotal) {
      throw new Error('Price changed! Please empty your cart and try again.');
    }

    // TODO: get matched coupon

    if (body.couponDiscount) {
      if (!body.couponId || isNaN(body.couponId)) {
        throw new Error('Coupon ID is required');
      }

      const coupon = await db.query.Coupons.findFirst({
        where: (fields, { eq, and }) =>
          and(eq(fields.id, Number(body.couponId)), eq(fields.isActive, true))
      });

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      if (coupon.type === 'Flat' && Number(coupon.discount) + 0.01 < Number(body.couponDiscount)) {
        throw new Error('Coupon discount does not match');
      } else {
        const calculatedDiscount = Math.min(
          (Number(coupon.discount) * subtotal) / 100,
          Number(coupon.maxDiscount)
        );

        if (calculatedDiscount + 0.01 < Number(body.couponDiscount)) {
          throw new Error('Coupon discount does not match');
        }
      }
    }

    // TODO: Calculate and validate tax and shipping charge

    // Validate Delivery Charge
    const deliveryOption = await db.query.DeliveryOptions.findFirst({
      where: (fields, { eq, and }) => and(eq(fields.name, body.deliveryOption))
    });

    if (!deliveryOption || Number(deliveryOption.charge) + 0.01 < Number(body.deliveryCharge)) {
      throw new Error('Invalid delivery option');
    }

    await db.transaction(async (tx) => {
      const insertedOrder = await tx
        .insert(Orders)
        .values({
          ...body,
          userId: 1, // harcoded for guest user
          orderStatus: 'Placed',
          paymentStatus: 'Pending',
          subtotal: String(body.subtotal),
          couponId: body.couponId ? Number(body.couponId) : null,
          couponDiscount: String(body.couponDiscount || 0),
          taxCharge: String(body.taxCharge || 0),
          shippingCharge: String(body.shippingCharge || 0),
          deliveryCharge: String(body.deliveryCharge || 0),
          total: String(body.total)
        })
        .returning({ id: Orders.id });

      const orderItems = body.cartItems.map((item) => ({
        ...item,
        orderId: insertedOrder[0].id,
        productId: item.productId,
        variation: item.variation,
        price: String(item.pricePerUnit),
        quantity: item.quantity
      }));

      await tx.insert(OrderItems).values(orderItems);

      // Order status history
      await tx.insert(OrderStatusHistory).values({
        orderId: insertedOrder[0].id,
        status: 'Placed',
        updatedBy: 1 // harcoded for guest user
      });

      // TODO: Update Stock

      // TODO: Update Coupon

      // TODO: Send Order Confirmation Mail
    });

    return c.json({ message: 'Order placed successfully!' });
  })
  .get('/apply-coupon', async (c) => {
    const code = c.req.query('code') as string;

    const coupon = await db.query.Coupons.findFirst({
      columns: {
        createdAt: false,
        updatedAt: false
      },
      where: (fields, { eq, and, gte, lte }) =>
        and(
          eq(fields.code, code),
          eq(fields.isActive, true),
          lte(fields.startDate, new Date().toISOString().split('T')[0]),
          gte(fields.endDate, new Date().toISOString().split('T')[0])
        )
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    return c.json(coupon);
  });
