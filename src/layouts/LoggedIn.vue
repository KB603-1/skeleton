<script setup>
import BottomNav from '@/components/BottomNav.vue';
import TopBar from '@/components/TopBar.vue';
import FloatingActionButton from '@/components/FloatingActionButton.vue';
</script>

<template>
  <div class="h-full flex flex-col">
    <TopBar />
    <main class="flex-1 bg-[#f2f0fb] min-h-0 overflow-y-auto">
      <div class="py-2">
        <RouterView />
      </div>
    </main>
    <FloatingActionButton />
    <BottomNav />
  </div>
</template>

<style scoped></style>
