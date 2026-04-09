<script setup>
import Card from '@/components/ui/card/Card.vue';
import { useRecordStore } from '@/stores/record';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const recordStore = useRecordStore();
const { expenses } = storeToRefs(recordStore);

const today = new Date();

const CATEGORY_STYLE = {
  식비: { emoji: '🍔', bg: 'bg-orange-100' },
  교통비: { emoji: '🚌', bg: 'bg-blue-100' },
  문화생활: { emoji: '🎭', bg: 'bg-purple-100' },
  급여: { emoji: '💰', bg: 'bg-green-100' },
  부업: { emoji: '💼', bg: 'bg-yellow-100' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return '오늘';
  if (d.toDateString() === yesterday.toDateString()) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const recentTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
    .map((e) => {
      const style = CATEGORY_STYLE[e.category?.name] ?? {
        emoji: '💸',
        bg: 'bg-gray-100',
      };
      const sign = e.type === 'expense' ? '-' : '+';
      return {
        emoji: style.emoji,
        bg: style.bg,
        title: e.title,
        sub: formatDate(e.date),
        amount: `${sign}${e.amount.toLocaleString()}원`,
        type: e.type,
      };
    });
});
</script>

<template>
  <div class="mx-5 mt-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-base font-bold text-gray-800">최근 내역</h3>
      <a href="#" class="text-xs text-purple-500 font-medium">전체보기 ›</a>
    </div>
    <div class="flex flex-col gap-2">
      <Card
        v-for="tx in recentTransactions"
        :key="tx.title"
        class="rounded-2xl px-4 py-3.5 border-0 gap-0 flex-row items-center gap-3 shadow-sm"
      >
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0',
            tx.bg,
          ]"
        >
          {{ tx.emoji }}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">{{ tx.title }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ tx.sub }}</p>
        </div>
        <p class="text-sm font-semibold text-gray-700">{{ tx.amount }}</p>
      </Card>
    </div>
  </div>
</template>
