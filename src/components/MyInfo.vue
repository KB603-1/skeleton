<script setup>

</script>

<template>
  <div class="mx-5 mt-3">
    <div
        v-if="spendingType"
        class="bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col gap-3"
    >
        <span
            class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start"
        >
          ✨ 나의 소비 유형
        </span>
      <div class="flex items-center gap-4">
        <div
            class="w-16 h-16 rounded-2xl bg-purple-400/30 flex items-center justify-center text-4xl shrink-0"
        >
          {{ spendingType.emoji }}
        </div>
        <div>
          <p class="text-white text-xl font-bold">{{ spendingType.label }}</p>
          <p class="text-purple-200 text-sm mt-1">{{ spendingType.desc }}</p>
        </div>
      </div>
      <div class="bg-purple-400/20 rounded-xl px-4 py-3">
        <p class="text-purple-100 text-xs">
          이번 달 가장 많이 쓴 카테고리를 기반으로 분석했어요.
        </p>
      </div>
    </div>
    <div
        v-else
        class="bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-center"
    >
      <p class="text-purple-200 text-sm">아직 지출 내역이 없어요</p>
      <p class="text-white font-semibold mt-1">기록을 시작해보세요! 📝</p>
    </div>
  </div>
</template>

<style scoped>

</style>