import {createRouter, createWebHistory} from "vue-router";
import {useUserStore} from "@/stores/user.js";
import ShareListPage from "@/pages/share/ShareListPage.vue";
import MainPage from "@/page/MainPage.vue";
import ChartPage from "@/page/ChartPage.vue";
import AddPage from "@/page/AddPage.vue";
import SignInPage from "@/pages/SignInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import LoggedIn from "@/layouts/LoggedIn.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/", component: LoggedIn, children: [
                {path: "/share", name: "share", component: ShareListPage},
                {path: "/", component: MainPage},
                {path: "/stats", component: ChartPage},
                {path: "/add", component: AddPage},
            ], meta: {requiresAuth: true}
        },
        {path: "/login", component: SignInPage},
        {path: "/signUp", component: SignUpPage},
    ],
});

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
        const loginInformation = localStorage.getItem("userId");
        if (loginInformation) {
            await userStore.fetchUser();
        }
    }

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        return next("/login"); //TODO: 로그인 페이지 구현
    }

    next();
});

export default router;
