import { db } from '../../db/index.js';
import {
  ProductCategories,
  ProductImages,
  ProductPricings,
  Products,
  ProductVariants
} from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
// import { addProductSchema, editProductSchema } from '@utils/zodSchemas.js';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { DashboardApp, generateFilterConditions } from '../../utils/functions.js';
import z from 'zod';
import {
  addProductSchema,
  addProductVariantSchema,
  editProductSchema,
  editProductVariantSchema,
  paginationSchema,
  savePricingSchema
} from '../../utils/zodSchemas.js';
import { uploadSingle } from '../../middleware/uploadSingle.js';
import fs from 'node:fs';
import path from 'node:path';
import { uploadAndProcess } from '../../middleware/uploadAndProcess.js';

export default DashboardApp()
  .get(
    '/',
    sValidator(
      'query',
      paginationSchema.extend({
        s: z.string().max(50).optional(),
        title_like: z.string().max(50).optional(),
        sortDirection: z.enum(['asc', 'desc']).default('asc'),
        sortBy: z.enum(['id', 'title']).default('id')
      })
    ),
    async (c) => {
      const { page, pageSize, sortDirection, sortBy, ...filters } = c.req.valid('query');

      const staticConditions: any = [];

      filters.title_like = filters.s;
      // filters.email_like = filters.s;
      // delete filters.s;

      const filterConditions = generateFilterConditions(filters, Products);
      const where = and(...staticConditions, ...filterConditions);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(Products)
        .where(where);
      const total = Number(totalResult[0]?.count ?? 0);

      // Dynamic sorting
      const orderBy = sortDirection === 'asc' ? asc(Products[sortBy]) : desc(Products[sortBy]);

      const products = await db.query.Products.findMany({
        with: {
          categories: {
            with: {
              category: {
                columns: {
                  name: true
                }
              }
            }
          },
          images: true
        },
        where,
        orderBy: [orderBy],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      // console.log(products);
      return c.json({ page, pageSize, total, data: products });
    }
  )
  .get(
    '/:id',

    async (c) => {
      const product = await db.query.Products.findFirst({
        with: {
          categories: {
            with: {
              category: {
                columns: {
                  name: true
                }
              }
            }
          },
          images: true,
          variants: true,
          pricings: true
        },
        where: (product, { eq }) => eq(product.id, Number(c.req.param('id')))
      });

      // console.log(products);
      return c.json({
        ...product,
        categoryIds: product?.categories.map((category) => category.categoryId)
      });
    }
  )
  .post(
    '/:id/add-photo',
    uploadAndProcess({
      fieldName: 'photo',
      maxSize: 8_000_000,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 600, height: 600 },
      convertToJpeg: false
    }),
    async (c) => {
      const uploaded = c.get('uploadedFile');

      const url = uploaded.path.substring(7, uploaded.path.length);

      await db.insert(ProductImages).values({
        productId: Number(c.req.param('id')),
        url
      });

      return c.json({
        message: 'Photo added successfully!'
      });
    }
  )
  .post('/:id/add-variant', sValidator('json', addProductVariantSchema), async (c) => {
    const body = c.req.valid('json');

    const createdVariant = await db
      .insert(ProductVariants)
      .values({ ...body, productId: Number(c.req.param('id')) })
      .returning();

    return c.json({ message: 'Product variant added successfully!', result: createdVariant });
  })
  .put('/:id/edit-variant/:variantId', sValidator('json', editProductVariantSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(ProductVariants)
      .set({ ...body })
      .where(eq(ProductVariants.id, Number(c.req.param('variantId'))));

    return c.json({ message: 'Product variant updated successfully!' });
  })
  .delete(
    '/:id/delete-photo/:photoId',

    async (c) => {
      const photoInfo = await db.query.ProductImages.findFirst({
        where: (productImage, { and, eq }) => eq(productImage.id, Number(c.req.param('photoId')))
      });

      if (!photoInfo) {
        throw new Error('Image not found!');
      }

      try {
        const filePath = path.join('uploads', photoInfo.url);

        fs.unlink(filePath, async (err) => {
          if (err) {
            console.log(err);
            // throw new Error('Could not delete photo!');
          }
        });
      } catch (error) {}

      await db.delete(ProductImages).where(eq(ProductImages.id, Number(c.req.param('photoId'))));

      return c.json({ message: 'Product photo deleted successfully!' });
    }
  )
  .delete(
    '/:id/delete-variant/:variantId',

    async (c) => {
      await db
        .delete(ProductVariants)
        .where(eq(ProductVariants.id, Number(c.req.param('variantId'))));

      return c.json({ message: 'Product variant deleted successfully!' });
    }
  )
  .delete(
    '/:id/delete-pricing/:variation',

    async (c) => {
      await db
        .delete(ProductPricings)
        .where(
          and(
            eq(ProductPricings.productId, Number(c.req.param('id'))),
            eq(ProductPricings.variation, c.req.param('variation'))
          )
        );

      return c.json({ message: 'Product pricing deleted successfully!' });
    }
  )
  .post('/', sValidator('json', addProductSchema), async (c) => {
    const body = c.req.valid('json');

    const createdProducts = await db
      .insert(Products)
      .values({
        title: body.title
      })
      .returning();

    return c.json({ message: 'Product added successfully!', id: createdProducts[0]?.id });
  })
  .put('/:id', sValidator('json', editProductSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');

    await db.transaction(async (tx) => {
      // 1. Update product fields
      await tx
        .update(Products)
        .set({ ...body })
        .where(eq(Products.id, id));

      // 2. Current category relations
      const currentCategories = await tx.query.ProductCategories.findMany({
        where: (pc, { and, eq }) => eq(pc.productId, id)
      });

      const currentIds = new Set(currentCategories.map((cc) => cc.categoryId));
      const newIds = new Set(body.categoryIds);

      // 3. Determine changes
      const insertIds = [...newIds].filter((cid) => !currentIds.has(cid));
      const deleteIds = [...currentIds].filter((cid) => !newIds.has(cid));

      // 4. Delete removed relations
      if (deleteIds.length) {
        await tx
          .delete(ProductCategories)
          .where(
            and(
              eq(ProductCategories.productId, id),
              inArray(ProductCategories.categoryId, deleteIds)
            )
          );
      }

      // 5. Insert new relations
      if (insertIds.length) {
        await tx.insert(ProductCategories).values(
          insertIds.map((cid) => ({
            productId: id,
            categoryId: cid
          }))
        );
      }
    });

    return c.json({ message: 'Product updated successfully!' });
  })

  .put('/:id/save-pricing', sValidator('json', savePricingSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');

    const insertItems: any[] = [];
    const updateItems: any[] = [];

    Object.keys(body).forEach((key) => {
      if (body[key].new) {
        delete body[key].new; // remove "new" flag before saving
        insertItems.push({ ...body[key] });
      } else {
        updateItems.push(body[key]);
      }
    });

    await db.transaction(async (tx) => {
      // ✅ Insert new records
      if (insertItems.length) {
        await tx.insert(ProductPricings).values(insertItems);
      }

      // ✅ Update existing records
      for (const item of updateItems) {
        await tx
          .update(ProductPricings)
          .set(item)
          .where(
            and(
              eq(ProductPricings.variation, item.variation),
              eq(ProductPricings.productId, item.productId)
            )
          );
      }
    });

    return c.json({ message: 'Product pricing updated successfully!' });
  })

  .delete('/:id', async (c) => {
    await db.delete(Products).where(eq(Products.id, Number(c.req.param('id'))));

    return c.json({ message: 'Product deleted successfully!' });
  });
