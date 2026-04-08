import { createRouter, createWebHistory } from 'vue-router';
import MonthlyHistory from '@/pages/MonthlyHistory.vue';
import EditRecord from '@/pages/EditRecord.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/monthly' },
    { path: '/monthly', component: MonthlyHistory },
    { path: '/edit', component: EditRecord },
  ],
});

export default router;
