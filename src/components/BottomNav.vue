<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useModalStore } from '@/stores/modal.js';
import MakeRecordModal from '@/components/MakeRecordModal.vue';
import { House, List, Plus, UserCog, ChartNoAxesColumn } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const modalStore = useModalStore();

function openMakeRecordModal() {
  modalStore.openModal(MakeRecordModal);
}

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <nav
    class="flex bg-white border-t border-gray-100 items-center justify-around px-4 py-2 z-50"
  >
    <!-- 홈 -->
    <button
      @click="router.push('/')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/') ? 'text-violet-600' : 'text-gray-400'"
    >
      <House />
      <span class="text-xs font-medium">홈</span>
    </button>

    <!-- 내역 -->
    <button
      @click="router.push('/monthly')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/monthly') ? 'text-violet-600' : 'text-gray-400'"
    >
      <List />
      <span class="text-xs font-medium">내역</span>
    </button>

    <!-- 추가 버튼 (가운데)
    <button
      @click="openMakeRecordModal"
      class="flex flex-col items-center justify-center w-14 h-14 -mt-6 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-300"
    >
      <Plus />
    </button>
     -->

    <!-- 통계 -->
    <button
      @click="router.push('/stats')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/stats') ? 'text-violet-600' : 'text-gray-400'"
    >
      <ChartNoAxesColumn />
      <span class="text-xs font-medium">통계</span>
    </button>

    <button
      @click="router.push('/mypage')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/mypage') ? 'text-violet-600' : 'text-gray-400'"
    >
      <UserCog />
      <span class="text-xs font-medium">내 정보</span>
    </button>
  </nav>
</template>
