<script setup>
import { ref } from 'vue';
import { useRecordStore } from '@/stores/record.js';
import GlobalModal from '@/components/GlobalModal.vue';
import SplashScreen from '@/components/SplashScreen.vue';

const recordStore = useRecordStore();
recordStore.fetchCategories();

const showSplash = ref(true);

function onSplashFinish() {
  showSplash.value = false;
}
</script>

<template>
  <SplashScreen v-if="showSplash" @finish="onSplashFinish" />
  <div v-else class="h-screen flex flex-col">
    <RouterView />
    <GlobalModal />
  </div>
</template>

<style scoped></style>
