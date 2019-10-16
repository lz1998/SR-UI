import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/layout'
  },
  {
    path: '/layout',
    name: 'layout',
    component: () => import('../views/layout/index.vue'),
    children:[
      {
        path:'/',
        redirect: '/home'
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('../views/home/index.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/settings/index.vue')
      },
      {
        path: '/display',
        name: 'display',
        component: () => import('../views/display/index.vue')
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('../views/about/index.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
