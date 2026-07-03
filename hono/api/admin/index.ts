import { DashboardApp } from '../../utils/functions.js';
// import 'dotenv/config';
import usersApp from './users.js';
import categoriesApp from './categories.js';
import attributesApp from './attributes.js';
import productsApp from './products.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.js';

export default DashboardApp()
  .use(adminAuthMiddleware)
  .route('/users', usersApp)
  .route('/categories', categoriesApp)
  .route('/attributes', attributesApp)
  .route('/products', productsApp);
