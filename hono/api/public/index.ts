import { Hono } from 'hono';
import productsApp from './products.js';
import packagesApp from './packages.js';
import categoriesApp from './categories.js';
import orderApp from './order.js';
import pagesApp from './pages.js';
import carouselsApp from './carousels.js';
import storeApp from './store.js';
import cicdApp from './cicd.js';

import { getDdosReport } from '../../middleware/ddosProtect.js';

export default new Hono()
  // .route('/products', productsApp)
  // .route('/packages', packagesApp)
  .route('/categories', categoriesApp);
// .route('/order', orderApp)
// .route('/pages', pagesApp)
// .route('/carousels', carouselsApp)
// .route('/store', storeApp)
// .route('/cicd', cicdApp)
// .get('/ddosreport', async (c) => {
//   return c.json(getDdosReport());
// });
