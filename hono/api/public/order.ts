import { db } from '../../db/index.js';
import { DeliveryOptions, Packages } from '../../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp().get(
  '/delivery-options',

  async (c) => {
    const items = await db.query.DeliveryOptions.findMany({
      columns: {
        createdAt: false,
        updatedAt: false,
        serverId: false
      },
      where: eq(DeliveryOptions['storeId'], c.get('storeInfo')?.storeId || 0)
    });
    return c.json(items);
  }
);
