import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import Login from '@/views/Login/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Foods from '@/views/Foods.vue'
import Orders from '@/views/Order/Orders.vue'
import OrderFood from '@/views/Order/OrderFoodSimple.vue'
import Feedback from '@/views/Feedback.vue'
import Reports from '@/views/Reports.vue'
import Departments from '@/views/Departments.vue'
import Employees from '@/views/Employees.vue'
import EmployeesSimple from '@/views/EmployeesSimple.vue'
import Schedules from '@/views/Schedules.vue'
import Vouchers from '@/views/Vouchers.vue'
import Profile from '@/views/Profile.vue'
import TestPage from '@/views/TestPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/foods',
    name: 'Foods',
    component: Foods,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true },
  },
  {
    path: '/order-food',
    name: 'OrderFood',
    component: OrderFood,
    meta: { requiresAuth: true },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: Feedback,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/employees',
    name: 'Employees',
    component: Employees,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/schedules',
    name: 'Schedules',
    component: Schedules,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/vouchers',
    name: 'Vouchers',
    component: Vouchers,
    meta: { requiresAuth: true, requiresPIC: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/test',
    name: 'TestPage',
    component: TestPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (
    to.meta.requiresPIC &&
    authStore.user?.role !== 'pic_catering' &&
    authStore.user?.role !== 'administrator'
  ) {
    next('/')
  } else {
    next()
  }
})

export default router
