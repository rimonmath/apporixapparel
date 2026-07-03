// import { Hono } from "hono";
// import { type JwtVariables } from "hono/jwt";
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { JWTUser } from './node-types';
import { AnyColumn, eq, ilike, gte, lte } from 'drizzle-orm';
// import type { AnyColumn } from "drizzle-orm";

export const hashPassword = (password: string) => {
  return hash(password);
};

export const verifyPassword = (hash: string, password: string) => {
  return verify(hash, password);
};

export const DashboardApp = () => new Hono<{ Variables: JWTUser }>();

type FilterOperators = 'eq' | 'like' | 'startsWith' | 'endsWith' | 'gte' | 'lte';

export function generateFilterConditions<T>(
  filters: Record<string, string | boolean>,
  table: T
): any[] {
  const conditions: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    const [field, operator] = key.split('_') as [keyof T, FilterOperators];

    if (!field || !operator) continue;

    const col = table[field] as unknown as AnyColumn;
    if (!col) continue;

    switch (operator) {
      case 'eq':
        conditions.push(eq(col, value));
        break;
      case 'like':
        conditions.push(ilike(col, `%${value}%`));
        break;
      case 'startsWith':
        conditions.push(ilike(col, `${value}%`));
        break;
      case 'endsWith':
        conditions.push(ilike(col, `%${value}`));
        break;
      case 'gte':
        conditions.push(gte(col as any, value));
        break;
      case 'lte':
        conditions.push(lte(col as any, value));
        break;
    }
  }

  return conditions;
}

export const replaceSpaces = (s: string | undefined) => {
  if (!s) {
    return '';
  }
  return s.replace(/\s+/g, '-');
};

export const replaceDashes = (s: string | undefined) => {
  if (!s) {
    return '';
  }
  return s.replace(/-+/g, ' ');
};
