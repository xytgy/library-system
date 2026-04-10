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
      redirect: '/dashboard',
      component: () => import('../layout/MainLayout.vue'),
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/index.vue'),
          meta: { title: '数据统计', roles: ['super_admin', 'admin', 'user', 'student'] }
        },
        {
          path: "/user",
          name: "User",
          component: () => import("../views/user/index.vue"),
          meta: { title: "用户管理", roles: ["super_admin", "admin"] }
        },
        {
          path: 'book',
          name: 'Book',
          component: () => import('../views/book/index.vue'),
          meta: { title: '图书管理', roles: ['super_admin', 'admin'] }
        },
        {
          path: 'hot-books',
          name: 'HotBooks',
          component: () => import('../views/hot-books/index.vue'),
          meta: { title: '热门图书', roles: ['super_admin', 'admin', 'student', 'user'] }
        },
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
