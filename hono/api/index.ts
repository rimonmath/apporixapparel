// authors.ts
import { Hono } from 'hono';

import publicRoutes from './public/index.js';
import authRoutes from './auth/index.js';
import userRoutes from './user/index.js';
import adminRoutes from './admin/index.js';
import storeRoutes from './store/index.js';
import guestRoutes from './guest/index.js';
import customerRoutes from './customer/index.js';
import { ddosProtectMiddleware } from '../middleware/ddosProtect.js';

export default new Hono()
  .use(ddosProtectMiddleware)
  // .route('/public', publicRoutes)
  .route('/auth', authRoutes);
// .route('/user', userRoutes)
// .route('/admin', adminRoutes)
// .route('/customer', customerRoutes)
// .route('/store/:subDomain', storeRoutes)
// .route('/guest', guestRoutes);
