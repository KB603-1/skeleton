import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from "@/stores/user.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [],
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
        const loginInformation = localStorage.getItem('userId');
        if (loginInformation) {
            await userStore.fetchUser();
        }
    }

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        return next('/login') //TODO: 로그인 페이지 구현
    }

    next();
});

export default router
