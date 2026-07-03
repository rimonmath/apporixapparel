import { Context } from 'hono';
import fs from 'node:fs';
import path from 'node:path';

// --- Escape HTML (safe for title, keywords, etc.) ---
const escapeHtml = (str?: string) =>
  str
    ? str.replace(
        /[&<>"']/g,
        (m) =>
          (
            ({
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;'
            }) as Record<string, string>
          )[m]
      )
    : '';

// --- Strip HTML tags ---
const stripHtml = (str?: string) => (str ? str.replace(/<[^>]*>/g, '') : '');

// --- Decode basic HTML entities (like &nbsp;) ---
const decodeEntities = (str: string) =>
  str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

// --- Upsert meta tags ---
const upsertMeta = (content: string, name: string, value: string) => {
  const metaRegex = new RegExp(`<meta\\s+name="${name}"\\s+content=".*?"\\s*\\/?>`, 'i');
  const metaTag = `<meta name="${name}" content="${value}" />`;
  return metaRegex.test(content)
    ? content.replace(metaRegex, metaTag)
    : content.replace(/<head>/i, `<head>\n${metaTag}`);
};

const upsertOGMeta = (content: string, property: string, value: string) => {
  const ogRegex = new RegExp(`<meta\\s+property="${property}"\\s+content=".*?"\\s*\\/?>`, 'i');
  const ogTag = `<meta property="${property}" content="${value}" />`;
  return ogRegex.test(content)
    ? content.replace(ogRegex, ogTag)
    : content.replace(/<head>/i, `<head>\n${ogTag}`);
};

export const renderSSRPage = async (params: {
  c: Context;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  bodyContent?: string;
  brandColor?: string;
  favicon?: string;
}) => {
  const {
    title = '',
    description = '',
    keywords = '',
    image = '',
    url = '',
    type = 'website',
    bodyContent = '',
    favicon = '',
    brandColor = '',
    c = null
  } = params;

  try {
    const storeInfo = c?.get('storeInfo');
    const updatedFavicon = favicon || storeInfo?.faviconUrl;
    const updatedTitle = title || storeInfo?.metaTitle;
    const updatedDescription = description || storeInfo?.metaDescription;
    const updatedKeywords = keywords || storeInfo?.metaKeywords?.join(',') || '';
    const updatedImage = image || storeInfo?.logoUrl;
    const updatedBrandColor = brandColor || storeInfo?.brandColor;

    const filePath = path.resolve('./dist/index.html');
    let content = await fs.promises.readFile(filePath, 'utf-8');

    // ✅ Sanitize description for meta tags
    let cleanDescription = stripHtml(updatedDescription || '');
    cleanDescription = decodeEntities(cleanDescription);
    cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim().slice(0, 160);
    cleanDescription = escapeHtml(cleanDescription);

    // Replace Favicon
    content = content.replace(
      /<link rel="icon" href=".*?" \/>/i,
      `<link rel="icon" href="${process.env.VITE_API_DOMAIN}${updatedFavicon}" />`
    );

    // ✅ Replace <title>
    content = content.replace(
      /<title>(.*?)<\/title>/i,
      `<title>${escapeHtml(updatedTitle)}</title>
        <style>
        :root, body {
          --primary-color: ${updatedBrandColor || '#000'} !important;
          --brand-color: ${updatedBrandColor || '#000'} !important;
         
        } 
        </style>
      `
    );

    // ✅ Meta + OG tags
    content = upsertMeta(content, 'description', cleanDescription);
    content = upsertMeta(content, 'keywords', escapeHtml(updatedKeywords));

    content = upsertOGMeta(content, 'og:title', escapeHtml(updatedTitle));
    content = upsertOGMeta(content, 'og:description', cleanDescription);
    content = upsertOGMeta(content, 'og:image', escapeHtml(updatedImage));
    content = upsertOGMeta(content, 'og:url', escapeHtml(url));
    content = upsertOGMeta(content, 'og:type', escapeHtml(type));

    // ✅ Inject body
    content = content.replace(
      /<div id="app"><\/div>/i,
      `<div id="app">
          <div style="opacity: 0"> ${bodyContent} </div>
      </div>`
    );

    return content;
  } catch (err) {
    console.error('SSR render error:', err);
    throw new Error('index.html not found');
  }
};
