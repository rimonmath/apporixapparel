import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import { z } from 'zod/v4';
import { sign } from 'hono/jwt';
import { db } from '../../db/index.js';
import { Users } from '../../db/schema.js';
import { DashboardApp, hashPassword, verifyPassword } from '../../utils/functions.js';
import 'dotenv/config';
import { userAuthMiddleware } from '../../middleware/userAuth.js';

import profileApp from './profile.js';
import storesApp from './stores.js';
import appsApp from './apps/index.js';
import referralApp from './referral.js';

export default DashboardApp()
  .use(userAuthMiddleware)
  .route('/profile', profileApp)
  .route('/stores', storesApp)
  .route('/apps', appsApp)
  .route('/referral', referralApp);
