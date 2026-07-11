import { db } from '../../db/index.js';
import { UserAddresses, Users } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addUserSchema, editUserSchema } from '@utils/zodSchemas.js';
import { asc, eq } from 'drizzle-orm';
import { DashboardApp, hashPassword } from '../../utils/functions.js';
import { addEditAddressSchema, updateProfileSchema } from '../../utils/zodSchemas.js';

export default DashboardApp()
  .get('/', async (c) => {
    const profile = await db.query.Users.findFirst({
      columns: {
        password: false,
        permissions: false,
        createdAt: false,
        updatedAt: false,
        emailVerificationCode: false,
        userType: false,
        isActive: false
      },
      with: {
        addresses: {
          columns: {
            createdAt: false,
            updatedAt: false,
            userId: false
          }
        }
      },
      where: (user, { eq }) => eq(user.id, c.get('jwtPayload').userId)
    });

    return c.json(profile);
  })
  .put('/', sValidator('json', updateProfileSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Users)
      .set(body)
      .where(eq(Users.id, c.get('jwtPayload').userId));

    return c.json({ message: 'Profile updated successfully!' });
  })
  .get('/summary', async (c) => {
    const profileSummary = await db.query.Users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        userType: true
      },
      where: (user, { eq }) => eq(user.id, c.get('jwtPayload').userId)
    });

    return c.json(profileSummary);
  })
  .get('/addresses', async (c) => {
    const addresses = await db.query.UserAddresses.findMany({
      where: (address, { eq }) => eq(address.userId, c.get('jwtPayload').userId)
    });

    return c.json(addresses);
  })
  .post('/addresses', sValidator('json', addEditAddressSchema), async (c) => {
    const body = c.req.valid('json');

    await db.insert(UserAddresses).values({
      userId: c.var.jwtPayload.userId,
      ...body
    });

    return c.json({ message: 'Address added successfully!' });
  })

  .put('/addresses/:addressId', sValidator('json', addEditAddressSchema), async (c) => {
    const body = c.req.valid('json');
    const addressId = c.req.param('addressId');

    await db
      .update(UserAddresses)
      .set(body)
      .where(eq(UserAddresses.id, Number(addressId)));

    return c.json({ message: 'Address updated successfully!' });
  })
  .delete('/addresses/:addressId', async (c) => {
    const addressId = c.req.param('addressId');

    await db.delete(UserAddresses).where(eq(UserAddresses.id, Number(addressId)));

    return c.json({ message: 'Address deleted successfully!' });
  });
