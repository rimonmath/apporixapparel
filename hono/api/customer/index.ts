import { DashboardApp } from '../../utils/functions.js';
import 'dotenv/config';
import { customerAuthMiddleware } from '../../middleware/customerAuth.js';

import profileApp from './profile.js';
import ordersApp from './orders.js';

export default DashboardApp()
  .use(customerAuthMiddleware)
  .route('/profile', profileApp)
  .route('/orders', ordersApp);
