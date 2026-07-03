import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

export type UploadedFile = {
  path: string;
  originalName: string;
  size: number;
  mimeType: string;
};

type UploadOptions = {
  fieldName: string;
  fixedFileName?: string; // relative path inside uploads/, e.g. "avatars/user123"
  maxSize?: number; // in bytes
  allowedExtensions?: string[];
};

export const uploadSingle = (options: UploadOptions) =>
  createMiddleware<{
    Variables: {
      uploadedFile: UploadedFile;
    };
  }>(async (c, next) => {
    const formData = await c.req.formData();
    const file = formData.get(options.fieldName);

    if (!(file instanceof File)) {
      throw new HTTPException(400, {
        message: `Missing file field: ${options.fieldName}`
      });
    }

    if (options.maxSize && file.size > options.maxSize) {
      throw new HTTPException(413, { message: 'File too large' });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext) {
      throw new HTTPException(400, {
        message: 'Could not determine file extension'
      });
    }

    if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
      throw new HTTPException(415, {
        message: `Extension .${ext} not allowed`
      });
    }

    let fullPath: string;

    if (options.fixedFileName) {
      // fixedFileName is relative path inside uploads/, append extension
      fullPath = path.join(
        'uploads',
        `u-${c.get('jwtPayload').userId}`,
        `${options.fixedFileName}.${ext}`
      );
    } else {
      // Use dated folders when no fixedFileName
      const today = new Date();
      const baseDir = path.join(
        'uploads',
        today.getFullYear().toString(),
        (today.getMonth() + 1).toString()
      );
      const fileName = `${options.fieldName}-${Date.now()}-${Math.floor(
        Math.random() * 999999
      )}-${file.name}`;
      fullPath = path.join(baseDir, fileName);
    }

    // Make sure directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(fullPath, buffer);

    c.set('uploadedFile', {
      path: fullPath,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    });

    await next();
  });
