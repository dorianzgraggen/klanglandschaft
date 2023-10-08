import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NodesView from '@/views/NodesView.vue'
import ExploreView from '@/views/ExploreView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/edit',
      name: 'Edit',
      // component: () => import('../views/AboutView.vue')
      component: NodesView
    },
    {
      path: '/explore',
      name: 'Explore',
      component: ExploreView
    }
  ]
})

export default router
