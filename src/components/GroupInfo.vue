<script setup>
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel/index.js';
import { computed } from 'vue';
import { useRecordStore } from '@/stores/record.js';
import BudgetStatusCarousel from './main/BudgetStatusCarousel.vue';

const recordStore = useRecordStore();

const currentMonthRecords = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return recordStore.records.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
});

const summary = computed(() => {
  const grouped = {};
  let totalIncome = 0;
  let totalExpense = 0;

  for (const record of currentMonthRecords.value) {
    const userId = record.user.id;

    if (!grouped[userId]) {
      grouped[userId] = {
        user: record.user,
        records: [],
        totalIncome: 0,
        totalExpense: 0,
      };
    }

    grouped[userId].records.push(record);

    if (record.type === 'income') {
      totalIncome += record.amount;
      grouped[userId].totalIncome += record.amount;
    } else {
      totalExpense += record.amount;
      grouped[userId].totalExpense += record.amount;
    }
  }

  return { totalIncome, totalExpense, groupedRecord: grouped };
});

const dumbScoreLabel = { '-2': '완전 낭비', '-1': '약간 낭비' };

const dumbExpenses = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return currentMonthRecords.value
    .filter((r) => {
      if (r.type !== 'expense') return false;
      if (r.dumbScore == null || r.dumbScore > -1) return false;
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
});

const dumbTotal = computed(() =>
  dumbExpenses.value.reduce((sum, r) => sum + r.amount, 0),
);

const top3CategoryExpense = computed(() => {
  const categoryMap = {};

  for (const record of currentMonthRecords.value) {
    if (record.type !== 'expense') continue;

    const category = record.category;
    const key = category.id;

    if (!categoryMap[key]) {
      categoryMap[key] = {
        category,
        totalExpense: 0,
      };
    }

    categoryMap[key].totalExpense += record.amount;
  }

  return Object.values(categoryMap)
    .sort((a, b) => b.totalExpense - a.totalExpense)
    .slice(0, 3);
});
</script>

<template>
  <Carousel class="mx-5 mt-3" :opts="{ align: 'center', containScroll: false }">
    <CarouselContent class="gap-3">
      <!-- <BudgetStatusCarousel :totalExpense="summary.totalExpense" /> -->
      <!-- 슬라이드 3: 멍청 비용 -->
      <CarouselItem>
        <div
          class="bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col h-[300px]"
        >
          <span
            class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-2"
          >
            🐔 멍청 비용
          </span>
          <p class="text-purple-200 text-sm">이번 달 아까운 지출</p>
          <p class="text-white text-3xl font-bold mt-1 mb-3">
            {{ dumbTotal.toLocaleString()
            }}<span class="text-xl font-semibold">원</span>
          </p>
          <div class="flex flex-col gap-2">
            <div
              v-if="dumbExpenses.length === 0"
              class="flex items-center justify-center flex-1 text-white/70 text-sm"
            >
              이번 달 멍청 비용이 없어요 🎉
            </div>
            <div
              v-for="item in dumbExpenses"
              :key="item.id"
              class="flex items-center bg-purple-400/30 rounded-xl px-3 py-2.5"
            >
              <span class="text-lg mr-2.5 shrink-0">{{
                item.category?.icon
              }}</span>
              <span
                class="flex-1 text-white text-sm font-medium min-w-0 truncate mr-2"
                >{{ item.title }}</span
              >
              <span
                class="bg-purple-300/30 text-purple-100 text-xs px-2 py-0.5 rounded-full mr-2 shrink-0"
              >
                {{ dumbScoreLabel[String(item.dumbScore)] }}
              </span>
              <span class="text-white text-sm font-bold shrink-0"
                >{{ item.amount.toLocaleString() }}원</span
              >
            </div>
          </div>
        </div>
      </CarouselItem>
    </CarouselContent>

    <!-- Dot indicator -->
    <CarouselDots class="mt-3" />
  </Carousel>
</template>

<style scoped></style>
