import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import SoundTestPlaygroundViewVue from '@/views/debug/SoundTestPlaygroundView.vue';
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
      path: '/debug/sound',
      component: SoundTestPlaygroundViewVue,
      meta: { layout: BlankLayout }
    }
  ]
});

export default router;
