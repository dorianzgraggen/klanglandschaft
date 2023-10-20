import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NodesView from '@/views/NodesView.vue';
import ExploreView from '@/views/ExploreView.vue';
import SoundView from '@/views/debug/SoundView.vue';
import BlankLayout from '@/BlankLayout.vue';
import PublicLayout from '@/PublicLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { layout: PublicLayout }
    },
    {
      path: '/edit',
      name: 'Edit',
      // component: () => import('../views/AboutView.vue')
      component: NodesView,
      meta: { layout: PublicLayout }
    },
    {
      path: '/explore',
      name: 'Explore',
      component: ExploreView,
      meta: { layout: PublicLayout }
    },
    {
      path: '/debug/sound',
      component: SoundView,
      meta: { layout: BlankLayout }
    }
  ]
});

export default router;
