import { createMiddleware } from 'hono/factory';
import { verify, type JwtVariables } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import type { JWTUser } from '../utils/node-types';
import { JwtTokenExpired } from 'hono/utils/jwt/types';
import 'dotenv/config';

export const guestAuthMiddleware = createMiddleware<{
  Variables: { jwtPayload: JWTUser };
}>(async (c, next) => {
  const token = c.req.header('Last-User-Agent');

  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  let decoded: JWTUser;

  try {
    decoded = (await verify(token, 'HijiBijiHijiBiji')) as JWTUser;
  } catch (err) {
    // console.log(err);
    if (err instanceof JwtTokenExpired) {
      console.log('TOKEN EXPIRED');
    }
    throw new HTTPException(401, { message: 'Unauthorised' });
  }

  if (decoded.userType !== 'Guest') {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  // const subDomain = c.req.param('subDomain') || '';

  // if (!decoded.ownedStores?.[subDomain]) {
  //   return c.json({ message: 'Unauthorized' }, 401);
  // }

  c.set('jwtPayload', { ...decoded /*, storeId: decoded.ownedStores[subDomain] */ });
  await next();
});
