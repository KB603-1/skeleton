<script setup>
import { useRecordStore } from '@/stores/record.js';

const recordStore = useRecordStore();
recordStore.fetchCategories();
import BottomNav from '@/components/BottomNav.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div
      class="relative w-full max-w-[390px] min-h-screen bg-[#f4f3ff] flex flex-col"
    >
      <main class="flex-1 overflow-y-auto pb-20">
        <RouterView />
        <!-- 테스트 링크 -->
        <router-link to="/share">share</router-link>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<style scoped></style>
