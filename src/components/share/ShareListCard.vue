<script setup>
defineProps({
  icon: String, // 아이콘 (emoji 또는 icon path)
  title: String, // "자취방 친구들"
  emojis: Array, // ["😊", "😂", "🤍"]
  amount: Number, // 175000
  memberCount: Number, // 5
});
</script>

<template>
  <div
    class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-center justify-between">
      <!-- 왼쪽: 아이콘 + 정보 -->
      <div class="flex items-start gap-3 flex-1">
        <div class="text-4xl">{{ icon }}</div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>

          <!-- 이모지들 -->
          <div class="flex gap-1 mt-2">
            <span v-for="(emoji, idx) in emojis" :key="idx" class="text-sm">
              {{ emoji }}
            </span>
            <span class="text-xs text-gray-500 ml-1"
              >{{ emojis.length }}명</span
            >
          </div>
        </div>
      </div>

      <!-- 오른쪽: 금액 + 인원 -->
      <div class="text-right">
        <p class="text-2xl font-bold text-purple-600">
          {{ amount.toLocaleString() }}원
        </p>
        <p class="text-xs text-gray-400 mt-1">{{ memberCount }}인</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
