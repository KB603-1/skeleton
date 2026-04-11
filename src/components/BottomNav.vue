<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useModalStore } from '@/stores/modal.js';
import MakeRecordModal from '@/components/MakeRecordModal.vue';
import { House, List, UserCog, ChartNoAxesColumn } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <nav
    class="flex bg-white border-t border-gray-100 w-full pb-[env(safe-area-inset-bottom)]"
  >
    <!-- 홈 -->
    <button
      @click="router.push('/')"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-3"
      :class="isActive('/') ? 'text-violet-600' : 'text-gray-400'"
    >
      <House />
      <span class="text-xs font-medium">홈</span>
    </button>

    <!-- 내역 -->
    <button
      @click="router.push('/monthly')"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-3"
      :class="isActive('/monthly') ? 'text-violet-600' : 'text-gray-400'"
    >
      <List />
      <span class="text-xs font-medium">내역</span>
    </button>

    <!-- 통계 -->
    <button
      @click="router.push('/stats')"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-3"
      :class="isActive('/stats') ? 'text-violet-600' : 'text-gray-400'"
    >
      <ChartNoAxesColumn />
      <span class="text-xs font-medium">통계</span>
    </button>

    <button
      @click="router.push('/mypage')"
      class="flex-1 flex flex-col items-center justify-center gap-1 py-3"
      :class="isActive('/mypage') ? 'text-violet-600' : 'text-gray-400'"
    >
      <UserCog />
      <span class="text-xs font-medium">내 정보</span>
    </button>
  </nav>
</template>
