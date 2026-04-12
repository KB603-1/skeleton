import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user.js';

import MainPage from '@/pages/main/MainPage.vue';
import ChartPage from '@/pages/chart/ChartPage.vue';
import SignInPage from '@/pages/SignInPage.vue';
import SignUpPage from '@/pages/SignUpPage.vue';
import LoggedIn from '@/layouts/LoggedIn.vue';
import MonthlyHistory from '@/pages/MonthlyHistory.vue';
import EditRecord from '@/pages/EditRecord.vue';
import GroupDetailPage from '@/pages/share/GroupDetailPage.vue';
import InvitePage from '@/pages/share/InvitePage.vue';
import MyPage from '@/pages/mypage/MyPage.vue';
import {useGroupStore} from "@/stores/group.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LoggedIn,
      children: [
        { path: '', component: MainPage, meta: {requiresTopbar: true} },
        { path: '/group', name: 'group', component: GroupDetailPage, meta: {requiresGroup: true} },
        { path: '/stats', component: ChartPage, meta: {requiresTopbar: true} },
        { path: '/monthly', component: MonthlyHistory, meta: {requiresTopbar: true} },
        { path: '/edit', component: EditRecord , meta: {requiresTopbar: true} },
        { path: '/invite', component: InvitePage , meta: {requiresTopbar: true} },
        { path: '/mypage', component: MyPage },
      ],
      meta: { requiresAuth: true },
    },
    { path: '/login', component: SignInPage },
    { path: '/signUp', component: SignUpPage },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const groupStore = useGroupStore();

  if (!userStore.isLoggedIn) {
    const loginInformation = localStorage.getItem('userId');
    if (loginInformation) {
      await userStore.fetchUser();
    }
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next('/login');
  }

  if (to.meta.requiresGroup && !groupStore.currentGroup) {
    return next('/');
  }

  next();
});

export default router;
