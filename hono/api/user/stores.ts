import { db } from '../../db/index.js';
import { Stores, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { asc, eq } from 'drizzle-orm';
import { DashboardApp, hashPassword } from '../../utils/functions.js';
import { addStoreSchema } from '../../utils/zodSchemas.js';
import { addStoreInfo } from '../../middleware/storeInfo.js';
import { sign } from 'hono/jwt';

export default DashboardApp()
  .get('/', async (c) => {
    const items = await db.query.Stores.findMany({
      columns: {
        serverId: false
      },
      with: {
        package: true
      },
      where: (fields, { eq }) => eq(fields.userId, c.get('jwtPayload').userId)
    });

    return c.json(items);
  })
  .post('/', sValidator('json', addStoreSchema), async (c) => {
    const body = c.req.valid('json');
    const userInfo = await db.query.Users.findFirst({
      where: (fields, { eq }) => eq(fields.id, c.var.jwtPayload.userId)
    });

    const [store] = await db
      .insert(Stores)
      .values({
        ...body,
        userId: c.get('jwtPayload').userId,
        status: 'Draft',
        packageId: 1,
        referredUserId: userInfo?.referredUserId || null
      })
      .returning();

    if (!store) {
      throw new Error("Store can't be added");
    }

    addStoreInfo(store.subDomain + '.khudroshop.com', { ...store, storeId: store.id });

    const user = await db.query.Users.findFirst({
      with: {
        stores: true
      },
      where: (fields, { eq }) => eq(fields.id, c.get('jwtPayload').userId)
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const accessTokenPayload = {
      userId: user.id,
      userType: user.userType,
      permissions: user.permissions,
      ownedStores: Object.fromEntries(user.stores.map((store) => [store.subDomain, store.id])),
      exp: now + 60 * 5000 // 5000 mins
    };

    const refreshToken = await sign(accessTokenPayload, process.env.VITE_JWTSECRET || '');

    return c.json({ message: 'Store added successfully!', refreshToken });
  });
