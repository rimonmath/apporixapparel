import { db } from '../../db/index.js';
import { DeliveryOptions } from '../../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp().get(
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
);
