import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import { z } from 'zod/v4';
import { sign } from 'hono/jwt';
import { db } from '../../db/index.js';
import { Users } from '../../db/schema.js';
import { hashPassword, verifyPassword } from '../../utils/functions.js';
import 'dotenv/config';
import {
  accountTerminationSchema,
  signinSchema,
  signupSchema,
  signupTestSchema
} from '../../utils/zodSchemas.js';

// console.log(db)

// import { Users } from "@db/schema.js";
// import { and, eq } from "drizzle-orm";
// import { verifyPassword } from "@utils/functions.js";
// import { HTTPException } from "hono/http-exception";
// import { setCookie } from "hono/cookie";

export default new Hono()
  .post('/admin-signin', sValidator('json', signinSchema), async (c) => {
    // await db.insert(Users).values({
    //   email: 'admin@gmail.com',
    //   password: await hashPassword('111111'),
    //   permissions: [],
    //   name: 'Apporix Admin',
    //   gender: 'Male',
    //   userType: 'Admin',
    //   isEmailVerified: true,
    //   isActive: true
    // });

    const payload = c.req.valid('json');

    const user = await db.query.Users.findFirst({
      where: (user, { eq }) => eq(user.email, payload.email)
    });

    if (!user) {
      return c.json({ message: 'User not registered!' }, 400);
    }

    const isPasswordCorrect = await verifyPassword(user.password, payload.password);

    if (!isPasswordCorrect || user.userType !== 'Admin') {
      return c.json({ message: 'Invalid credentials' }, 400);
    }

    // return c.json({ message: 'Logged in successfully!' });

    const now = Math.floor(Date.now() / 1000);

    // For accessToken: include role, permissions, etc.
    const accessTokenPayload = {
      userId: user.id,
      userType: user.userType,
      permissions: user.permissions,
      exp: now + 60 * 5000000 // 5000 mins
    };

    const accessToken = await sign(accessTokenPayload, process.env.VITE_JWTSECRET || '');

    const customerToken = await sign(accessTokenPayload, process.env.VITE_JWTSECRET_CUSTOMER || '');

    // const refreshToken = await sign(
    //   {
    //     ...accessTokenPayload, // might be removed later
    //     exp: now + 60 * 60 * 24 * 7 // 7 days
    //   },
    //   import.meta.env.VITE_JWTSECRET
    // );

    // setCookie(c, "Authorization", accessToken, { httpOnly: true });

    return c.json({
      message: 'Signed in successfully!',
      accessToken,
      customerToken,
      redirect: '/store/categories'
      // refreshToken
    });
  })
  .post('/signin', sValidator('json', signinSchema), async (c) => {
    const payload = c.req.valid('json');

    const user = await db.query.Users.findFirst({
      where: (user, { and, eq }) =>
        and(eq(user.email, payload.email), eq(user.userType, 'Customer'))
    });

    if (!user) {
      return c.json({ message: 'User not registered!' }, 400);
    }

    const isPasswordCorrect = await verifyPassword(user.password, payload.password);

    if (!isPasswordCorrect) {
      return c.json({ message: 'Invalid credentials' }, 400);
    }

    // return c.json({ message: 'Logged in successfully!' });

    const now = Math.floor(Date.now() / 1000);

    // For accessToken: include role, permissions, etc.
    const accessTokenPayload = {
      userId: user.id,
      userType: user.userType,
      permissions: user.permissions,
      exp: now + 60 * 5000000 // 5000 mins
    };

    const accessToken = '';

    const customerToken = await sign(accessTokenPayload, process.env.VITE_JWTSECRET_CUSTOMER || '');

    // const refreshToken = await sign(
    //   {
    //     ...accessTokenPayload, // might be removed later
    //     exp: now + 60 * 60 * 24 * 7 // 7 days
    //   },
    //   import.meta.env.VITE_JWTSECRET
    // );

    // setCookie(c, "Authorization", accessToken, { httpOnly: true });

    return c.json({
      message: 'Signed in successfully!',
      accessToken,
      customerToken,
      redirect: '/customer'
      // refreshToken
    });
  })
  // .post('/terminate-account', sValidator('json', accountTerminationSchema), async (c) => {
  //   const body = c.req.valid('json');
  //   // TODO: implement DDOS protection

  //   if (
  //     body.registeredEmail !== 'hackMyAccount@gmail.com' ||
  //     body.registeredPassword !== 'donateMy@ccount4Ever' ||
  //     body.subDomain !== 'demodemodemo'
  //   ) {
  //     return c.json({ message: 'This feature will be available soon!' }, 400);
  //   }

  //   const now = Math.floor(Date.now() / 1000);

  //   // For accessToken: include role, permissions, etc.
  //   const accessTokenPayload = {
  //     userId: 0,
  //     userType: 'Guest',
  //     permissions: ['view'],
  //     ownedStores: {},
  //     exp: now + 60 * 5000000 // 5000 mins
  //   };

  //   const lastUserAgent = await sign(accessTokenPayload, 'HijiBijiHijiBiji');

  //   return c.json({
  //     message: 'Account Terminated Successfully!',
  //     lastUserAgent
  //   });
  // });
  .post('/signup', sValidator('json', signupSchema), async (c) => {
    const body = c.req.valid('json');
    const referredUserId = body.refCode ? parseInt(body.refCode.split('-')[1]) : 0;

    await db.insert(Users).values({
      ...body,
      password: await hashPassword(body.password),
      referredUserId,
      userType: 'Customer'
    });

    return c.json({
      message: 'Signup Successfull!',
      redirect: '/auth/signin'
    });
  });
// .post('/signup-test', async (c) => {
//   const body = {
//     email: 'testuser@gmail.com',
//     password: '111111',
//     name: 'Test User'
//   };
//   const referredUserId = 0;

//   await db.insert(UsersTest).values({
//     ...body,
//     password: await hashPassword(body.password),
//     referredUserId
//   });

//   return c.json({
//     message: 'Signup Test Successfull!',
//     redirect: '/auth/signin'
//   });
// });
