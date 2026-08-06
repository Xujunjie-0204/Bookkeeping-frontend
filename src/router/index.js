import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/index.vue'
import ProfileView from '@/views/ProfileView.vue'
import ProductManageView from '@/views/ProductManageView.vue'
import ProductTypeManageView from '@/views/ProductTypeManageView.vue'
import PurchaseManageView from '@/views/PurchaseManageView.vue'
import InventoryManageView from '@/views/InventoryManageView.vue'
import SaleManageView from '@/views/SaleManageView.vue'
import ExpenseManageView from '@/views/ExpenseManageView.vue'
import MenuManageView from '@/views/MenuManageView.vue'
import RoleManageView from '@/views/RoleManageView.vue'
import ConfigManageView from '@/views/ConfigManageView.vue'

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
    path: '/purchases',
    name: 'purchases',
    component: PurchaseManageView
  },
  {
    path: '/sales',
    name: 'sales',
    component: SaleManageView
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpenseManageView
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryManageView
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
  },
  {
    path: '/system/configs',
    name: 'configs',
    component: ConfigManageView
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
