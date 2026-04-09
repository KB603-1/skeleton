<script setup>
defineEmits(['addGroup']);
</script>

<template>
  <header class="bg-white px-5 py-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">공유 가계부</h1>

      <button
        @click="$emit('addGroup')"
        class="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span>
        <span class="text-sm font-medium">모임 만들기</span>
      </button>
    </div>
  </header>
</template>

<style scoped></style>
