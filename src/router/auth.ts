import type { RouteRecordRaw } from 'vue-router'

// Vite dynamic import (lazy-loaded Vue components)
const subPages = import.meta.glob('../pages/auth/*.vue')

const subRoutes = Object.keys(subPages)
  .filter((filePath) => {
    const match = filePath.match(/\/([^/]+)\.vue$/)
    if (!match) return false

    const fileName = match[1]
    return fileName !== 'Index' && fileName !== '404'
  })
  .map((filePath) => {
    const match = filePath.match(/\/([^/]+)\.vue$/)
    if (!match) return null

    const fileName = match[1]

    // Convert filenames like 'Details_id' → '/details/:id'
    const formattedPath = fileName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → kebab-case
      .toLowerCase()
      .replace(/_([a-zA-Z0-9]+)/g, '/:$1') // _param → /:param

    return {
      path: formattedPath,
      name: fileName,
      component: subPages[filePath] as () => Promise<unknown>,
    }
  })
  .filter((route): route is NonNullable<typeof route> => route !== null) as RouteRecordRaw[]
// 👆 First filter out null, then cast whole array

export default subRoutes
