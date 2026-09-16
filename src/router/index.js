import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const loggedIn = localStorage.getItem('currentUser')
  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login' }
  }
  if (to.path === '/login' && loggedIn) {
    return { path: '/dashboard' }
  }
})

export default router
