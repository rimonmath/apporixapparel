import { db } from '../../db/index.js';
import { Categories, ProductCategories } from '../../db/schema.js';
import { desc } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const orderBy = desc(Categories['order']);
      const categories = await db.query.Categories.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
          isActive: false,
          storeId: false,
          serverId: false
        },
        orderBy: [orderBy],
        where: (category, { and, eq }) =>
          and(eq(category.isActive, true), eq(category.storeId, c.get('storeInfo')?.storeId || 0))
      });
      return c.json(categories);
    }
  )
  .get('/:categoryId/products', async (c) => {
    const products = await db.query.Products.findMany({
      columns: {
        createdAt: false,
        updatedAt: false,
        storeId: false,
        serverId: false
      },
      with: {
        categories: {
          with: {
            category: {
              columns: {
                name: true,
                id: true
              }
            }
          }
        }, // includes product_categories rows
        images: {
          columns: {
            url: true
          }
        },
        pricings: {
          columns: {
            buyPrice: false,
            storeId: false,
            serverId: false
          }
        }
      },
      where: (products, { inArray, eq, and }) =>
        and(
          eq(products.status, 'Published'),
          eq(products.storeId, c.get('storeInfo')?.storeId || 0),
          inArray(
            products.id,
            db
              .select({ productId: ProductCategories.productId })
              .from(ProductCategories)
              .where(eq(ProductCategories.categoryId, Number(c.req.param('categoryId'))))
          )
        )
    });

    return c.json(products);
  });
