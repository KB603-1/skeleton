<script setup>
import { computed } from 'vue';
import { useRecordStore } from '@/stores/record';
import { storeToRefs } from 'pinia';

const recordStore = useRecordStore();
const { expenses } = storeToRefs(recordStore);

const SPENDING_TYPES = {
  '식비':      { label: '식도락가형',   emoji: '🍽️', desc: '맛있는 걸 아는 당신!' },
  '생활비':    { label: '생활충실형',   emoji: '🏠', desc: '알차게 사는 당신!' },
  '주거/통신': { label: '홈마스터형',   emoji: '📡', desc: '편안한 집을 사랑하는 당신!' },
  '교통/차량': { label: '이동왕형',     emoji: '🚗', desc: '어디든 달려가는 당신!' },
  '쇼핑/뷰티': { label: '쇼핑킹형',    emoji: '🛍️', desc: '아름다움을 아는 당신!' },
  '문화/여가': { label: '문화인형',     emoji: '🎭', desc: '삶의 여유를 아는 당신!' },
  '건강/의료': { label: '건강지킴이형', emoji: '💊', desc: '건강을 챙기는 당신!' },
  '기타':      { label: '자유영혼형',   emoji: '✨', desc: '나만의 길을 가는 당신!' },
};

const currentMonthExpenses = computed(() => {
  const now = new Date();
  return expenses.value.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
});

const spendingType = computed(() => {
  if (currentMonthExpenses.value.length === 0) return null;
  const totals = {};
  for (const e of currentMonthExpenses.value) {
    const name = e.category?.name ?? '기타';
    totals[name] = (totals[name] ?? 0) + e.amount;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  return SPENDING_TYPES[top] ?? { label: '절약가형', emoji: '💰', desc: '알뜰살뜰 당신!' };
});
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