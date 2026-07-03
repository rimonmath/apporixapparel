import { db } from '../../db/index.js';
import { Carousels } from '../../db/schema.js';
import { sValidator } from '@hono/standard-validator';
import { and, asc, eq } from 'drizzle-orm';
import { DashboardApp } from '../../utils/functions.js';
import { editCarouselSchema } from '../../utils/zodSchemas.js';
import { uploadSingle } from '../../middleware/uploadSingle.js';
import { promises as fs } from 'node:fs';
import { uploadAndProcess } from '../../middleware/uploadAndProcess.js';

export default DashboardApp()
  .get(
    '/',

    async (c) => {
      const orderBy = asc(Carousels['id']);

      const carousels = await db.query.Carousels.findMany({
        where: (fields, { eq }) => eq(fields.storeId, c.var.jwtPayload.storeId),
        orderBy: [orderBy]
      });
      return c.json(carousels);
    }
  )
  .post(
    '/',
    // uploadSingle({
    //   fieldName: 'url',
    //   maxSize: 10_000_000,
    //   allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
    // }),

    uploadAndProcess({
      fieldName: 'url',
      maxSize: 8_000_000,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      resize: { width: 1280, height: 550 },
      convertToJpeg: true
    }),
    async (c) => {
      const uploaded = c.get('uploadedFile');

      const url = uploaded.path.substring(7, uploaded.path.length);

      await db.insert(Carousels).values({
        url,
        storeId: c.var.jwtPayload.storeId
      });

      return c.json({
        message: 'Carousel added successfully!'
      });
    }
  )

  .put('/:id', sValidator('json', editCarouselSchema), async (c) => {
    const body = c.req.valid('json');

    await db
      .update(Carousels)
      .set({
        ...body
      })
      .where(
        and(
          eq(Carousels.id, Number(c.req.param('id'))),
          eq(Carousels.storeId, c.var.jwtPayload.storeId)
        )
      );

    return c.json({ message: 'Carousel updated successfully!' });
  })

  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));

    if (isNaN(id)) {
      throw new Error('Invalid carousel ID!');
    }

    const currentCarousel = await db.query.Carousels.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.storeId, c.var.jwtPayload.storeId))
    });

    if (!currentCarousel) {
      throw new Error('Carousel not found!');
    }

    await db
      .delete(Carousels)
      .where(and(eq(Carousels.id, id), eq(Carousels.storeId, c.var.jwtPayload.storeId)));

    await fs.unlink('uploads/' + currentCarousel.url!);

    return c.json({ message: 'Carousel deleted successfully!' });
  });
