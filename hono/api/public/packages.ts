import { db } from '../../db/index.js';
import { Packages } from '../../db/schema.js';
import { asc } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp().get(
  '/',

  async (c) => {
    const orderBy = asc(Packages['monthlyChargeInUsd']);

    const packages = await db.query.Packages.findMany({
      columns: {
        createdAt: false,
        updatedAt: false,
        serverId: false
      },
      orderBy: [orderBy]
    });
    return c.json(packages);
  }
);
