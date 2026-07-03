import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { DashboardApp } from '../../utils/functions.js';
import { Stores, Users } from '../../db/schema.js';

export default DashboardApp().get('/summary', async (c) => {
  const summary = await db.query.Users.findFirst({
    columns: {
      referralReward: true,
      id: true
    },
    with: {
      referredStores: {
        columns: {
          id: true,
          name: true,
          subDomain: true,
          customDomain: true,
          status: true
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },

    where: (user, { eq }) => eq(user.id, c.get('jwtPayload').userId)
  });

  const referredUsers = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      storesCount: sql<number>`COUNT(${Stores.id})`.as('storesCount')
    })
    .from(Users)
    .leftJoin(Stores, eq(Stores.userId, Users.id))
    .where(eq(Users.referredUserId, c.get('jwtPayload').userId))
    .groupBy(Users.id);

  return c.json({
    summary,
    referredUsers
  });
});
