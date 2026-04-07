import {defineStore} from "pinia";
import api from "@/plugin/api.js";
import {ref} from "vue";

export const useUserStore = defineStore("user", () => {
    const user = ref({
        id: "",
        nickname: "",
        isLoggedIn: false,
    });

    async function register(registerData) {
        let isUsed = true;
        try {
            const res = await api.get(`/users?username=${registerData.username}`);
            isUsed = res.data.length !== 0;
        } catch (error) {
            throw new Error("회원가입 중 오류가 발생했습니다.");
        }
        if (isUsed) {
            throw new Error("이미 사용중인 아이디입니다.");
        }
        try {
            await api.post(`/users`, registerData);
        } catch (error) {
            throw new Error("회원가입 중 오류가 발생했습니다.");
        }
    }

    async function login(loginData) {
        let response;
        try {
            response = await api.get(`/users?username=${loginData.username}`);
        } catch (e) {
            throw new Error("로그인 중 오류가 발생했습니다.");
        }
        if (response.data.length === 0 || response.data[0]?.password !== loginData.password) {
            throw new Error("잘못된 아이디 혹은 비밀번호 입니다.");
        }
        const found = response.data[0];
        localStorage.setItem("userId", found.id);
        setUser(found);
    }

    function logout() {
        localStorage.removeItem("userId");
        user.value = {
            id: "",
            nickname: "",
            isLoggedIn: false,
        };
    }

    async function fetchUser() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            logout();
            return;
        }
        try {
            const res = await api.get(`/users/${userId}`);
            const data = res.data;
            setUser(data);
        } catch (e) {
            logout();
        }
    }

    function setUser(data) {
        user.value = {
            id: data.id,
            nickname: data.nickname,
            isLoggedIn: true,
        };
    }

    return {user, login, register, fetchUser, logout};
});