import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: '/tables',
        name: 'TablesList',
        component: () => import('@/views/TablesList.vue')
      },
      {
        path: '/table/:schema/:tableName',
        name: 'TableEditor',
        component: () => import('@/views/TableEditor.vue')
      },
      {
        path: '/forms',
        name: 'Forms',
        component: () => import('@/views/Forms.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
