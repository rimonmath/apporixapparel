import type { RouteRecordRaw } from 'vue-router';

// Vite glob import (all store .vue files)
const rootPages = import.meta.glob('../pages/admin/**/*.vue');

// A helper type for our temporary route structure
interface TempRoute {
  path: string;
  name: string;
  component: (() => Promise<unknown>) | null;
  children: TempRoute[];
}

const routeMap = new Map<string, TempRoute>();

Object.keys(rootPages).forEach((filePath) => {
  const match = filePath.match(/\/admin\/(.+)\.vue$/);
  if (!match || !match[1]) return;

  const relativePath = match[1]; // e.g., "Index", "Users/Index", "Users/Details_id"
  const segments = relativePath.split('/');

  const fileName = segments.pop() || '';
  const parentPath = segments.join('/');

  if (!fileName) return;

  // Format path: "Details_id" → "details/:id"
  const formattedPath = fileName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → kebab-case
    .toLowerCase()
    .replace(/_([a-zA-Z0-9]+)/g, '/:$1'); // _param → /:param

  const route: TempRoute = {
    path: formattedPath === 'index' ? '' : formattedPath,
    name: 'admin-' + relativePath.replace(/\//g, '_'),
    component: rootPages[filePath] as () => Promise<unknown>,
    children: []
  };

  if (parentPath) {
    // Subfolder route
    if (!routeMap.has(parentPath)) {
      routeMap.set(parentPath, {
        path: parentPath.toLowerCase(),
        name: 'admin-' + parentPath.replace(/\//g, '_'),
        component: null,
        children: []
      });
    }

    const parent = routeMap.get(parentPath)!;

    if (fileName.toLowerCase() === 'index') {
      parent.component = rootPages[filePath] as () => Promise<unknown>;
    } else {
      parent.children.push(route);
    }
  } else {
    // Top-level route
    if (fileName.toLowerCase() !== 'index') {
      routeMap.set(relativePath, route);
    }
  }
});

// Convert to RouteRecordRaw[]
const rootRoutes: RouteRecordRaw[] = Array.from(routeMap.values()).map(
  (r) => r as unknown as RouteRecordRaw
);

export default rootRoutes;
