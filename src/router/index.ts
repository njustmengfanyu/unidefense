import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Detection from '../views/Detection.vue'
import Result from '../views/Result.vue'
import Login from '../views/Login.vue'
import { useAppStore } from '../composables/useAppStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/detection',
    name: 'Detection',
    component: Detection
  },
  {
    path: '/result',
    name: 'Result',
    component: Result
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const store = useAppStore()
  if (!store.state.auth.isLoggedIn && to.name !== 'Login') {
    next({ name: 'Login' })
    return
  }

  if (store.state.auth.isLoggedIn && to.name === 'Login') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
