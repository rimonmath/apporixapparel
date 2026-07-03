import { db } from '../../db/index.js';
import { Carousels } from '../../db/schema.js';
import { asc } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp().get(
  '/',

  async (c) => {
    const orderBy = asc(Carousels['id']);

    const carousels = await db.query.Carousels.findMany({
      columns: {
        createdAt: false,
        isActive: false,
        updatedAt: false
      },
      where: (fields, { and, eq }) =>
        and(eq(fields.isActive, true), eq(fields.storeId, c.get('storeInfo')?.storeId || 0)),
      orderBy: [orderBy]
    });
    return c.json(carousels);
  }
);
