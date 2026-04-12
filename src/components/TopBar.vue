<script setup>
import { useRoute } from 'vue-router';
import GroupDrawer from '@/components/GroupDrawer.vue';

const route = useRoute();
</script>

<template>
  <header
    v-if="route.path !== '/mypage' && route.path !== '/group'"
    class="flex flex-col z-50 w-full bg-[#F4F5F7]"
  >
    <div class="flex h-20 items-center justify-between px-2 pr-5">
      <!-- 좌측 슬롯 (직접 채워넣으세요) -->
      <img
        src="../assets/images/app-logo.png"
        alt="Logo"
        class="h-16 w-auto object-contain"
      />

      <!-- 우측 그룹 드로워 (마이페이지 제외) -->
      <div class="flex items-center">
        <GroupDrawer />
      </div>
    </div>
  </header>
</template>

<style scoped></style>
