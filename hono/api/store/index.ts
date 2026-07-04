import { DashboardApp } from '../../utils/functions.js';
import infoApp from './info.js';
import categoriesApp from './categories.js';
import attributesApp from './attributes.js';
import productsApp from './products.js';
import dOptionsApp from './doptions.js';
import couponsApp from './coupons.js';
import ordersApp from './orders.js';
import carouselsApp from './carousels.js';
import pagesApp from './pages.js';
import settingsApp from './settings.js';

import { storeAuthMiddleware } from '../../middleware/storeAuth.js';

export default DashboardApp()
  .use(storeAuthMiddleware)
  // .route('/info', infoApp)
  .route('/categories', categoriesApp)
  .route('/attributes', attributesApp)
  .route('/products', productsApp)
  .route('/doptions', dOptionsApp)
  .route('/carousels', carouselsApp)
  .route('/coupons', couponsApp)
  // .route('/orders', ordersApp)
  .route('/pages', pagesApp);
// .route('/settings', settingsApp);
