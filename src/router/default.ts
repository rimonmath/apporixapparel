import type { RouteRecordRaw } from 'vue-router'

// Vite glob import (lazy-loaded)
const subPages = import.meta.glob('../pages/home/*.vue')

// Define route type
interface SubRoute {
  path: string
  name: string
  component: () => Promise<unknown>
}

const subRoutes: SubRoute[] = Object.keys(subPages)
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

    // Convert filenames like 'Details_id' to '/details/:id'
    const formattedPath = fileName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → kebab-case
      .toLowerCase()
      .replace(/_([a-zA-Z0-9]+)/g, '/:$1') // _param → /:param

    return {
      path: formattedPath,
      name: fileName,
      component: subPages[filePath] as () => Promise<unknown>, // Lazy-load component
    }
  })
  .filter((route): route is SubRoute => route !== null)

export default subRoutes
