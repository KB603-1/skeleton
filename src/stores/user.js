import { defineStore } from 'pinia';
import api from '@/plugin/api.js';
import { computed, ref, watch } from 'vue';
import bcrypt from 'bcryptjs';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);

  const isLoggedIn = computed(() => !!user.value);

  async function register(registerData) {
    let isUsed = true;
    try {
      const res = await api.get(`/users?username=${registerData.username}`);
      isUsed = res.data.length !== 0;
    } catch (error) {
      throw new Error('회원가입 중 오류가 발생했습니다.');
    }
    if (isUsed) {
      throw new Error('이미 사용중인 아이디입니다.');
    }
    try {
      const hashedPassword = await bcrypt.hash(registerData.password, 10);
      await api.post(`/users`, {
          nickname: registerData.nickname,
          username: registerData.username,
          password: hashedPassword,
      });
    } catch (error) {
      throw new Error('회원가입 중 오류가 발생했습니다.');
    }
  }

  async function login(loginData) {
    let response;
    try {
      response = await api.get(`/users?username=${loginData.username}`);
    } catch (e) {
      throw new Error('로그인 중 오류가 발생했습니다.');
    }
    const user = response.data[0];
    if (!user) {
      throw new Error('잘못된 아이디 혹은 비밀번호 입니다.');
    }

    /*
    기존 회원가입 계정 비교용
    TODO: hash만 비교
     */
    const isPlain = user.password === loginData.password;
    const isHashed = user.password.startsWith('$2') && await bcrypt.compare(loginData.password, user.password);

    if (!isPlain && !isHashed) {
      throw new Error('잘못된 아이디 혹은 비밀번호 입니다.');
    }
    localStorage.setItem('userId', user.id);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('userId');
    user.value = null;
  }

  async function changeNickname(newNickname) {
    try {
      await api.patch(`/users/${user.value.id}`, { nickname: newNickname });
      user.value.nickname = newNickname;
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async function changePassword(currentPassword, newPassword) {
    let response;
    try {
      response = await api.get(`/users/${user.value.id}`);
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    const data = response.data;
    if (data.password !== currentPassword) {
      throw new Error('현재 비밀번호가 올바르지 않습니다.');
    }
    try {
      await api.patch(`/users/${user.value.id}`, { password: newPassword });
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async function updateBudgetGoal(newBudget) {
    try {
      await api.patch(`/users/${user.value.id}`, { budgetGoal: newBudget });
      user.value.budgetGoal = newBudget;
    } catch (e) {
      throw new Error('예산 설정 중 오류가 발생했습니다.');
    }
  }

  async function fetchUser() {
    const userId = localStorage.getItem('userId');
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
      budgetGoal: data.budgetGoal || 0,
    };
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    changeNickname,
    changePassword,
    updateBudgetGoal,
    fetchUser,
    logout,
  };
});
