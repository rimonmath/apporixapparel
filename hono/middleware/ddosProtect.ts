import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

const WINDOW_MS = 10_000;
const MAX_REQUESTS = 10;
const BLOCK_MS = 60_000;
const CLEANUP_INTERVAL = 60_000;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

type Hit = {
  count: number;
  start: number;
};

export const hits = new Map<string, Hit>();
export const blocked = new Map<string, number>();

export function getDdosReport() {
  return {
    hits: Object.fromEntries(
      Array.from(hits.entries()).map(([ip, hit]) => [
        ip,
        { count: hit.count, start: new Date(hit.start).toISOString() }
      ])
    ),
    blocked: Object.fromEntries(
      Array.from(blocked.entries()).map(([ip, until]) => [ip, new Date(until).toISOString()])
    )
  };
}

setInterval(() => {
  const now = Date.now();

  for (const [ip, until] of blocked) {
    if (until <= now) blocked.delete(ip);
  }

  for (const [ip, hit] of hits) {
    if (now - hit.start > WINDOW_MS * 2) {
      hits.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

export const ddosProtectMiddleware = createMiddleware(async (c, next) => {
  // 1️⃣ Skip GET / HEAD / OPTIONS
  if (SAFE_METHODS.has(c.req.method)) {
    return await next();
  }

  // 2️⃣ Trust Cloudflare IP only
  const ip = c.req.header('cf-connecting-ip');
  if (!ip) {
    return await next();
  }

  const now = Date.now();

  // 3️⃣ Block check
  const blockedUntil = blocked.get(ip);
  if (blockedUntil) {
    if (blockedUntil > now) {
      throw new HTTPException(403, {
        message: `Blocked until ${new Date(blockedUntil).toISOString()}`
      });
    } else {
      blocked.delete(ip);
    }
  }

  // 4️⃣ Rate limit
  const hit = hits.get(ip);

  if (!hit || now - hit.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
  } else {
    hit.count++;

    if (hit.count > MAX_REQUESTS) {
      blocked.set(ip, now + BLOCK_MS);
      hits.delete(ip);

      throw new HTTPException(429, {
        message: 'Too many requests, temporarily blocked'
      });
    }
  }

  await next();
});
