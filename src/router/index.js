import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ProductManageView from '@/views/ProductManageView.vue'
import ProductTypeManageView from '@/views/ProductTypeManageView.vue'
import MenuManageView from '@/views/MenuManageView.vue'
import RoleManageView from '@/views/RoleManageView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/products',
    name: 'products',
    component: ProductManageView
  },
  {
    path: '/product-types',
    name: 'productTypes',
    component: ProductTypeManageView
  },
  {
    path: '/system/menus',
    name: 'menus',
    component: MenuManageView
  },
  {
    path: '/system/roles',
    name: 'roles',
    component: RoleManageView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && userStore.token) {
    return { path: '/dashboard' }
  }
  return true
})

export default router
