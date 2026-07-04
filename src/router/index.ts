import { createRouter, createWebHistory } from 'vue-router';
import defaultRoutes from './default.ts';
import authRoutes from './auth.ts';
import dashboardRoutes from './dashboard.ts';
import storeRoutes from './store.ts';
import adminRoutes from './admin.ts';
import customerRoutes from './customer.ts';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'default-parent',
      redirect: '/auth/login',
      component: () => import('../pages/home/Index.vue'),
      children: [
        {
          path: '',
          name: 'default-home',
          component: () => import('../pages/home/Landing.vue')
        },
        {
          path: 'pricing',
          name: 'pricing',
          component: () => import('../pages/home/khudro/Pricing.vue')
        },
        {
          path: 'doc',
          name: 'doc',
          component: () => import('../pages/home/khudro/Doc.vue')
        },
        {
          path: 'privacy',
          name: 'privacy',
          component: () => import('../pages/home/khudro/Privacy.vue')
        },
        {
          path: 'terms',
          name: 'terms',
          component: () => import('../pages/home/khudro/Terms.vue')
        },
        {
          path: 'products/:productId/:productTitle',
          name: 'product-details',
          component: () => import('../pages/home/products/ProductDetails.vue')
        },
        {
          path: 'categories/:categoryId/:categoryName',
          name: 'category',
          component: () => import('../pages/home/Categories.vue')
        },
        {
          path: 'pages/:pageId/:pageName',
          name: 'page',
          component: () => import('../pages/home/Pages.vue')
        },
        {
          path: 'search/:keyword',
          name: 'search',
          component: () => import('../pages/home/Search.vue')
        },
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/home/404.vue')
        },
        ...defaultRoutes
      ]
    },
    {
      path: '/r/:refCode',
      name: 'referral-link',
      component: () => import('../pages/auth/RefCode.vue')
    },
    {
      path: '/auth',
      name: 'auth-parent',
      redirect: '/auth/signin',
      component: () => import('../pages/auth/Index.vue'),
      children: [
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/auth/404.vue')
        },
        ...authRoutes
      ]
    },
    {
      path: '/sso',
      name: 'sso',
      component: () => import('../pages/sso/Index.vue')
    },
    {
      path: '/store',
      name: 'store-parent',
      component: () => import('../pages/store/Index.vue'),
      children: [
        {
          path: '',
          name: 'store-overview',
          component: () => import('../pages/store/Overview.vue')
        },
        // {
        //   path: 'categories',
        //   component: () => import('../pages/store/Categories.vue')
        // },
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/store/404.vue')
        },
        ...storeRoutes
      ]
    },
    {
      path: '/K2PD34f0BCaeFL6q9PZIPC',
      name: 'admin-parent',
      component: () => import('../pages/admin/Index.vue'),
      children: [
        {
          path: '',
          name: 'admin-overview',
          component: () => import('../pages/admin/Overview.vue')
        },
        // {
        //   path: 'categories',
        //   component: () => import('../pages/store/Categories.vue')
        // },
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/admin/404.vue')
        },
        ...adminRoutes
      ]
    },
    {
      path: '/customer',
      name: 'customer-parent',
      component: () => import('../pages/customer/Index.vue'),
      children: [
        {
          path: '',
          name: 'customer-overview',
          component: () => import('../pages/customer/Overview.vue')
        },
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/customer/404.vue')
        },
        ...customerRoutes
      ]
    },
    {
      path: '/dashboard',
      name: 'dashboard-parent',
      component: () => import('../pages/dashboard/Index.vue'),
      children: [
        {
          path: '',
          name: 'dashboard-overview',
          component: () => import('../pages/dashboard/Overview.vue')
        },
        {
          path: ':catchAll(.*)',
          component: () => import('../pages/dashboard/404.vue')
        },
        ...dashboardRoutes
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title.toString();
  }
  document.body.classList.add('lazy-loading');
  next();
});

router.afterEach(() => {
  // clearTimeout(loadingTimer);
  document.body.classList.remove('lazy-loading');

  window.scrollTo({
    top: 0,
    behavior: 'smooth' // optional: for smooth scrolling
  });
  document.body.classList.remove('lazy-loading');
});

export default router;
