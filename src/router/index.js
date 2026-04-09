import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import MainPage from '@/pages/main/MainPage.vue';
import ChartPage from '@/pages/chart/ChartPage.vue';
import AddPage from '@/pages/add/AddPage.vue';
import SignInPage from '@/pages/SignInPage.vue';
import SignUpPage from '@/pages/SignUpPage.vue';
import LoggedIn from '@/layouts/LoggedIn.vue';
import MonthlyHistory from '@/pages/MonthlyHistory.vue';
import EditRecord from '@/pages/EditRecord.vue';
import GroupDetailPage from '@/pages/share/GroupDetailPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LoggedIn,
      children: [
        { path: '', component: MainPage },
        { path: '/group', name: 'group', component: GroupDetailPage },
        { path: '/stats', component: ChartPage },
        { path: '/add', component: AddPage },
        { path: '/monthly', component: MonthlyHistory },
        { path: '/edit', component: EditRecord },
      ],
      meta: { requiresAuth: true },
    },
    { path: '/login', component: SignInPage },
    { path: '/signUp', component: SignUpPage },
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
    return next('/login');
  }

  next();
});

export default router;
