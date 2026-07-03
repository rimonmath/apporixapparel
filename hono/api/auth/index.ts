import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import { z } from 'zod/v4';
import { sign } from 'hono/jwt';
import { db } from '../../db/index.js';
import { Users, UsersTest } from '../../db/schema.js';
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
  .post('/signin', sValidator('json', signinSchema), async (c) => {
    // await db.insert(Users).values({
    //   email: 'mhleton@gmail.com',
    //   password: await hashPassword('111111'),
    //   permissions: [],
    //   name: 'Mahmudul Hasan',
    //   address: 'Rajshahi, Bangladesh',
    //   gender: 'Male',
    //   userType: 'User',
    //   isVerified: true,
    //   isActive: true
    // });

    const payload = c.req.valid('json');

    const user = await db.query.Users.findFirst({
      with: {
        stores: true
      },
      where: (user, { eq }) => eq(user.email, payload.email)
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
      ownedStores: Object.fromEntries(user.stores.map((store) => [store.subDomain, store.id])),
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
      redirect: '/dashboard'
      // refreshToken
    });
  })
  .post('/terminate-account', sValidator('json', accountTerminationSchema), async (c) => {
    const body = c.req.valid('json');
    // TODO: implement DDOS protection

    if (
      body.registeredEmail !== 'hackMyAccount@gmail.com' ||
      body.registeredPassword !== 'donateMy@ccount4Ever' ||
      body.subDomain !== 'demodemodemo'
    ) {
      return c.json({ message: 'This feature will be available soon!' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);

    // For accessToken: include role, permissions, etc.
    const accessTokenPayload = {
      userId: 0,
      userType: 'Guest',
      permissions: ['view'],
      ownedStores: {},
      exp: now + 60 * 5000000 // 5000 mins
    };

    const lastUserAgent = await sign(accessTokenPayload, 'HijiBijiHijiBiji');

    return c.json({
      message: 'Account Terminated Successfully!',
      lastUserAgent
    });
  })
  .post('/signup', sValidator('json', signupSchema), async (c) => {
    const body = c.req.valid('json');
    const referredUserId = body.refCode ? parseInt(body.refCode.split('-')[1]) : 0;

    await db.insert(Users).values({
      ...body,
      password: await hashPassword(body.password),
      referredUserId
    });

    return c.json({
      message: 'Signup Successfull!',
      redirect: '/auth/signin'
    });
  })
  .post('/signup-test', async (c) => {
    const body = {
      email: 'testuser@gmail.com',
      password: '111111',
      name: 'Test User'
    };
    const referredUserId = 0;

    await db.insert(UsersTest).values({
      ...body,
      password: await hashPassword(body.password),
      referredUserId
    });

    return c.json({
      message: 'Signup Test Successfull!',
      redirect: '/auth/signin'
    });
  });

// .post('/request-reset-password', sValidator('json', requestResetPasswordSchema), async (c) => {
//   const body = c.req.valid('json');

//   const existingUser = await db.query.Users.findFirst({
//     where: (fields, { eq, and }) =>
//       and(eq(fields.email, body.email), eq(fields.userStatus, 'Approved')),
//     with: {
//       passwordResets: true
//     }
//   });

//   if (!existingUser) {
//     throw new Error("Pasword can't be reset now!");
//   }

//   const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
//   const resets = existingUser.passwordResets ?? [];

//   const lastReset = resets.at(-1); // modern syntax, cleaner than length - 1

//   if (lastReset && lastReset.createdAt > new Date(Date.now() - SIX_HOURS_MS)) {
//     throw new Error('Too many requests. Please try again after 6 hours.');
//   }

//   const token = crypto.randomBytes(32).toString('hex');
//   const validTill = Date.now() + 60 * 60 * 1000 + '';

//   const resetLink = `${process.env.FRONTEND_DOMAIN}/auth/reset-password?token=${token}`;

//   await db.insert(PasswordResets).values({
//     userId: existingUser.id,
//     token,
//     validTill
//   });

//   await sendEmail(
//     existingUser.email,
//     '🔐 Reset Your Password – Valid for 1 Hour',
//     `
// <div style="font-family: Arial, sans-serif; color: #333;">
//   <h2 style="color: #2563eb;">Password Reset Request</h2>
//   <p>Hello ${existingUser.name || 'there'},</p>
//   <p>We received a request to reset your password. Click the button below to create a new one:</p>

//   <p>
//     <a href="${resetLink}"
//        style="display: inline-block; background-color: #2563eb; color: #fff;
//               text-decoration: none; padding: 10px 20px; border-radius: 6px;
//               font-weight: bold;">
//       Reset Password
//     </a>
//   </p>

//   <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
//   <p style="word-break: break-all; color: #555;">${resetLink}</p>

//   <p>This link will expire in <strong>1 hour</strong> for your security.</p>

//   <p>If you didn’t request a password reset, you can safely ignore this email.</p>

//   <p>Best regards,<br/>The Apporix Nexus Team</p>
// </div>
// `
//   );

//   return c.json({
//     message: 'Password reset link sent to your email. Please check your inbox (and spam folder).'
//   });
// })
// .post('/reset-password', sValidator('json', resetPasswordSchema), async (c) => {
//   const body = c.req.valid('json');

//   const passwordReset = await db.query.PasswordResets.findFirst({
//     where: (fields, { eq, and }) =>
//       and(eq(fields.token, body.token), eq(fields.isCompleted, false)),
//     with: {
//       user: true
//     }
//   });

//   if (!passwordReset) {
//     throw new Error("Pasword can't be reset!");
//   }

//   if (Number(passwordReset.validTill) < Date.now()) {
//     throw new Error('This reset request is expired!');
//   }

//   await db.transaction(async (tx) => {
//     await tx
//       .update(Users)
//       .set({
//         password: await hashPassword(body.password)
//       })
//       .where(eq(Users.id, passwordReset.userId));

//     await tx
//       .update(PasswordResets)
//       .set({
//         isCompleted: true
//       })
//       .where(eq(PasswordResets.id, passwordReset.id));
//   });

//   await sendEmail(
//     passwordReset.user.email,
//     '✅ Password Reset Successful',
//     `
//     <div style="font-family: Arial, sans-serif; color: #333;">
//       <h2 style="color: #16a34a;">Password Reset Successful</h2>
//       <p>Hello ${passwordReset.user.name || 'there'},</p>
//       <p>Your password has been successfully reset.</p>
//       <p>If you didn’t perform this action, please contact our support immediately.</p>
//       <p style="margin: 20px 0;">
//         <a href="${process.env.FRONTEND_DOMAIN}/auth/signin"
//            style="display: inline-block; background-color: #16a34a; color: #fff;
//                   text-decoration: none; padding: 10px 20px; border-radius: 6px;
//                   font-weight: bold;">
//           Sign In Now
//         </a>
//       </p>
//       <p>Best regards,<br/>The Apporix Nexus Team</p>
//     </div>
//     `
//   );

//   return c.json({
//     message: 'Password Reset Successfull!',
//     redirect: '/auth/signin'
//   });
// })

// .post('/google-callback', async (c) => {
//   // 1. Receive the Authorization Code from the frontend
//   const { authorizationCode } = await c.req.json();
//   // You should update your Vue.js frontend to send 'authorizationCode' instead of 'idToken'

//   // NOTE: You must also pass the redirect URI used in the Google Cloud Console
//   // const redirectUri = 'http://localhost:5123/api/auth/signin';
//   const redirectUri = process.env.FRONTEND_DOMAIN; // + '/auth/google-callback/'; // **Replace with your actual redirect URI**

//   // http://localhost:3123/api/auth/google-callback

//   try {
//     // 2. EXCHANGE the Authorization Code for the Access/ID Tokens
//     const { tokens } = await client.getToken({
//       code: authorizationCode,
//       redirect_uri: redirectUri
//     });

//     // The ID Token is now securely retrieved by the backend
//     const idToken = tokens.id_token;

//     if (!idToken) {
//       return c.json({ error: 'Failed to retrieve ID Token' }, 401);
//     }

//     // 3. VERIFY the ID Token to get the user payload
//     const ticket = await client.verifyIdToken({
//       idToken: idToken,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const payload = ticket.getPayload();

//     // =========================== Local Auth======================

//     const user = await db.query.Users.findFirst({
//       where: (fields, { eq }) => eq(fields.email, payload?.email!)
//     });

//     if (!user) {
//       return c.json(
//         { message: 'Email not registered!', redirect: '/auth/signup?email=' + payload?.email },
//         400
//       );
//     }

//     if (user.userStatus === 'Pending') {
//       return c.json(
//         {
//           message:
//             'Your account is in pending approval state! Please wait for 24 hours, Or contact Admin'
//         },
//         400
//       );
//     }

//     if (user.userStatus === 'Declined') {
//       return c.json(
//         {
//           message: 'Your are not allowed to used our service ! Please contact Admin.'
//         },
//         400
//       );
//     }

//     if (user.userStatus === 'Disabled') {
//       return c.json(
//         {
//           message: 'Your is disabled! Please contact Admin.'
//         },
//         400
//       );
//     }

//     // return c.json({ message: 'Logged in successfully!' });

//     const now = Math.floor(Date.now() / 1000);

//     const accessTokenPayload = {
//       userId: user.id,
//       userType: user.userType,
//       permissions: user.permissions,
//       exp: now + 30 * 24 * 60 * 60 // 30 days
//     };

//     const accessToken = await sign(accessTokenPayload, process.env.VITE_JWTSECRET);

//     // const refreshToken = await sign(
//     //   {
//     //     ...accessTokenPayload, // might be removed later
//     //     exp: now + 60 * 60 * 24 * 7 // 7 days
//     //   },
//     //   import.meta.env.VITE_JWTSECRET
//     // );

//     // setCookie(c, "Authorization", accessToken, { httpOnly: true });

//     return c.json({
//       message: 'Signed in successfully!',
//       accessToken,
//       redirect: user.userType === 'Admin' ? '/dashboard' : '/user',
//       userType: user.userType
//       // refreshToken
//     });
//   } catch (error) {
//     console.error('Code exchange or token verification failed:', error);
//     return c.json({ error: 'Authentication failed' }, 401);
//   }
// });;
