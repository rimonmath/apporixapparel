import { DashboardApp } from '../../utils/functions.js';
import usersApp from './users.js';
import storesApp from './stores.js';

import { guestAuthMiddleware } from '../../middleware/guestAuth.js';

export default DashboardApp()
  .use(guestAuthMiddleware)
  .route('/users', usersApp)
  .route('/stores', storesApp);
