import { db } from '../../db/index.js';
import {
  ProductCategories,
  ProductImages,
  ProductPricings,
  Products,
  ProductVariants
} from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
import { and, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const products = await db.query.Products.findMany({
        with: {
          // categories: {
          //   with: {
          //     category: {
          //       columns: {
          //         name: true
          //       }
          //     }
          //   }
          // },

          images: true
        },

        limit: 50
      });
      // console.log(products);
      return c.json(products);
    }
  )
  .get(
    '/top',

    async (c) => {
      const products = await db.query.Products.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
          isOnSale: false
        },
        with: {
          // categories: {
          //   with: {
          //     category: {
          //       columns: {
          //         name: true
          //       }
          //     }
          //   }
          // },
          pricings: {
            columns: {
              buyPrice: false
            }
          },
          images: {
            columns: {
              url: true
            },
            limit: 1
          }
        },
        where: (product, { and, eq }) =>
          and(eq(product.isOnSale, true), eq(product.status, 'Published')),

        limit: 8
      });
      // console.log(products);
      return c.json(products);
    }
  )
  .get(
    '/recent',

    async (c) => {
      const products = await db.query.Products.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
          isOnSale: false
        },
        with: {
          // categories: {
          //   with: {
          //     category: {
          //       columns: {
          //         name: true
          //       }
          //     }
          //   }
          // },
          pricings: {
            columns: {
              buyPrice: false
            }
          },
          images: {
            columns: {
              url: true
            },
            limit: 1
          }
        },
        where: (product, { and, eq }) => eq(product.status, 'Published'),

        orderBy: (product, { desc }) => desc(product.id),

        limit: 50
      });
      // console.log(products);
      return c.json(products);
    }
  )
  .get(
    '/details/:id',

    async (c) => {
      const product = await db.query.Products.findFirst({
        columns: {
          createdAt: false,
          updatedAt: false,
          isOnSale: false
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
          },
          images: true,
          variants: true,
          pricings: {
            columns: {
              buyPrice: false,
              createdAt: false,
              updatedAt: false
            }
          }
        },
        where: (product, { eq, and }) => eq(product.id, Number(c.req.param('id')))
      });

      // console.log(products);
      return c.json(
        product
          ? {
              ...product,
              categoryIds: product?.categories.map((category) => category.categoryId)
            }
          : null
      );
    }
  )
  .get('/by-keyword/:keyword', async (c) => {
    const products = await db.query.Products.findMany({
      columns: {
        createdAt: false,
        updatedAt: false
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
            buyPrice: false
          }
        }
      },
      where: (fields, { eq, and, ilike }) =>
        and(eq(fields.status, 'Published'), ilike(fields.title, `%${c.req.param('keyword')}%`)),
      limit: 100
    });
    // console.log(products);
    return c.json(products);
  });
