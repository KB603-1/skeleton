import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user.js';

import MonthlyHistory from '@/pages/MonthlyHistory.vue';
import EditRecord from '@/pages/EditRecord.vue';
import MainPage from '@/pages/main/MainPage.vue';
import ChartPage from '@/pages/chart/ChartPage.vue';
import AddPage from '@/pages/add/AddPage.vue';
import ShareListPage from '@/pages/share/ShareListPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/monthly', component: MonthlyHistory },
    { path: '/edit', component: EditRecord },
    { path: '/share', name: 'share', component: ShareListPage },
    { path: '/', component: MainPage },
    { path: '/stats', component: ChartPage },
    { path: '/add', component: AddPage },
    {path: '/login', component: SignInPage },
    {path: '/signUp', component: SignUpPage },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.isLoggedIn) {
    const loginInformation = localStorage.getItem('userId');
    if (loginInformation) {
      await userStore.fetchUser();
    }
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next('/login'); //TODO: 로그인 페이지 구현
  }

  next();
});

export default router;
