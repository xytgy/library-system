  import { createRouter, createWebHistory} from 'vue-router'
  import type { RouteRecordRaw } from 'vue-router'
  import { ElMessage } from 'element-plus'


  const routes: Array<RouteRecordRaw> = [
    { 
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录' }},

    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/login/ForgotPassword.vue'),
      meta: { title: '找回密码' }
    },
    {
      path: '/',
      name: 'MainLayout',
      component: () => import('../layout/MainLayout.vue'),
      children: [
        {
          path: 'book',
          name: 'Book',
          component: () => import('../views/book/index.vue'),
          meta: { title: '图书管理', roles: ['super_admin', 'admin'] }
        }
      ]
    }
  ]
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
  })

  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    if (to.path === '/login' || to.path === '/forgot-password') {
      if (token) {
        next('/')
      } else {
        next()
      }
    } else {
      if (token) {
        // 权限校验
        if (to.meta.roles) {
          const roles = to.meta.roles as string[]
          if (roles.includes(userInfo.role)) {
            next()
          } else {
            // 无权限，跳转到默认页面或提示
            ElMessage.error('抱歉，您没有权限访问该页面')
            next(from.path || '/')
          }
        } else {
          next()
        }
      } else {
        next('/login')
      }
    }
  })

  export default router
