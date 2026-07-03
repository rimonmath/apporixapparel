import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

export type UploadOptions = {
  fieldName: string;
  maxSize?: number;
  allowedExtensions?: string[];
  fixedFileName?: string; // optional
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain';
  };
  convertToJpeg?: boolean; // default = true
};

export type UploadedFile = {
  path: string;
  originalName: string;
  size: number;
  mimeType: string;
};

export const uploadAndProcess = (options: UploadOptions) =>
  createMiddleware<{
    Variables: { uploadedFile: UploadedFile };
  }>(async (c, next) => {
    const subDomain = c.req.param('subDomain')
      ? c.req.param('subDomain') + '.khudroshop.com'
      : 'nodomain.khudroshop.com';
    const formData = await c.req.formData();
    const file = formData.get(options.fieldName);

    // 1. Validation: file required
    if (!(file instanceof File)) {
      throw new HTTPException(400, {
        message: `Missing file field: ${options.fieldName}`
      });
    }

    // 2. Validate size
    if (options.maxSize && file.size > options.maxSize) {
      throw new HTTPException(413, { message: 'File too large' });
    }

    // 3. Validate extension based on original filename
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
      throw new HTTPException(400, { message: 'Invalid file extension' });
    }

    if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
      throw new HTTPException(415, {
        message: `Extension .${ext} not allowed`
      });
    }

    // Determine output extension
    const outputExt = options.convertToJpeg === false ? ext : 'jpg';

    // 4. Build storage path: uploads/YYYY/MM
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString();

    const baseDir = path.join('uploads', subDomain, year, month);

    console.log(baseDir);

    fs.mkdirSync(baseDir, { recursive: true });

    // 5. Determine final filename
    let outputName: string;
    if (options.fixedFileName) {
      outputName = `${options.fixedFileName}.${outputExt}`;
    } else {
      outputName = `${options.fieldName}-${Date.now()}.${outputExt}`;
    }

    const outputPath = path.join(baseDir, outputName);

    // 6. Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let sharpInstance = sharp(buffer);

    // 7. Optional resize
    // if (options.resize) {
    //   sharpInstance = sharpInstance.resize(options.resize.width, options.resize.height);

    // }

    if (options.resize) {
      sharpInstance = sharpInstance.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit ?? 'inside',
        withoutEnlargement: true
      });
    }

    // 8. Optional JPEG conversion (default true)
    if (options.convertToJpeg !== false) {
      sharpInstance = sharpInstance.jpeg({ quality: 90 });
    }

    // 9. Save processed image
    await sharpInstance.toFile(outputPath);

    // 10. Store metadata
    c.set('uploadedFile', {
      path: outputPath,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    });

    await next();
  });
