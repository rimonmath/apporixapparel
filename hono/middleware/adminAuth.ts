import { createMiddleware } from 'hono/factory';
import { verify, type JwtVariables } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import type { JWTUser } from '../utils/node-types';
import { JwtTokenExpired } from 'hono/utils/jwt/types';
import 'dotenv/config';

export const adminAuthMiddleware = createMiddleware<{
  Variables: { jwtPayload: JWTUser };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  let decoded: JWTUser;

  try {
    decoded = (await verify(token, process.env.VITE_JWTSECRET!)) as JWTUser;
  } catch (err) {
    // console.log(err);
    if (err instanceof JwtTokenExpired) {
      console.log('TOKEN EXPIRED');
    }
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  if (decoded.userType !== 'Admin') {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  c.set('jwtPayload', decoded);
  await next();
});
