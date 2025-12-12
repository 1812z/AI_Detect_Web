import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '监控画面墙', requiresAuth: true }
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('../views/ModelManagement.vue'),
    meta: { title: '大模型管理', requiresAuth: true }
  },
  {
    path: '/rules',
    name: 'Rules',
    component: () => import('../views/RuleManagement.vue'),
    meta: { title: '规则管理', requiresAuth: true }
  },
  {
    path: '/streams',
    name: 'Streams',
    component: () => import('../views/StreamManagement.vue'),
    meta: { title: '视频流管理', requiresAuth: true }
  },
  {
    path: '/stream-rules',
    name: 'StreamRules',
    component: () => import('../views/StreamRuleManagement.vue'),
    meta: { title: '视频流规则管理', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !isLoggedIn()) {
    // 需要认证但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isLoggedIn()) {
    // 已登录用户访问登录页，跳转到首页
    next('/dashboard')
  } else {
    next()
  }
})

export default router
