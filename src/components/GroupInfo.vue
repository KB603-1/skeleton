<script setup>
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel/index.js';
import { computed } from 'vue';
import { useRecordStore } from '@/stores/record.js';
import { useGroupStore } from '@/stores/group.js';
import { storeToRefs } from 'pinia';
import GroupBudgetStatusCarousel from './main/GroupBudgetStatusCarousel.vue';

const recordStore = useRecordStore();
const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

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
      <!-- 슬라이드 1: 그룹 예산 현황 -->
      <GroupBudgetStatusCarousel
        :totalExpense="summary.totalExpense"
        :budgetGoal="currentGroup?.budgetGoal || 0"
        :memberCount="currentGroup?.members?.length || 1"
      />
      <!-- 슬라이드 2: 멍청 비용 -->
      <CarouselItem>
        <div class="bg-white rounded-2xl p-5 flex flex-col h-75 shadow-sm border border-gray-100">
          <!-- 헤더 -->
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-bold text-[#191919] text-base">🐔 멍청 비용</h3>
            <span class="text-[10px] font-bold px-2 py-1 rounded-md bg-[#836BC2]/10 text-[#836BC2]">
              이번 달
            </span>
          </div>

          <!-- 총 금액 -->
          <div class="mt-2 mb-3">
            <p class="text-[10px] font-medium text-gray-400 mb-0.5">이번 달 아까운 지출</p>
            <p class="text-2xl font-bold text-[#836BC2]">
              {{ dumbTotal.toLocaleString() }}<span class="text-sm font-semibold text-gray-500 ml-0.5">원</span>
            </p>
          </div>

          <!-- 목록 -->
          <div class="flex flex-col gap-2 flex-1 overflow-hidden">
            <div
              v-if="dumbExpenses.length === 0"
              class="flex items-center justify-center flex-1 text-gray-400 text-sm"
            >
              이번 달 멍청 비용이 없어요 🎉
            </div>
            <div
              v-for="item in dumbExpenses"
              :key="item.id"
              class="flex items-center bg-[#836BC2]/5 border border-[#836BC2]/10 rounded-xl px-3 py-2.5"
            >
              <span class="text-lg mr-2.5 shrink-0">{{ item.category?.icon }}</span>
              <span class="flex-1 text-gray-700 text-sm font-medium min-w-0 truncate mr-2">{{ item.title }}</span>
              <span class="bg-[#836BC2]/10 text-[#836BC2] text-xs px-2 py-0.5 rounded-full mr-2 shrink-0">
                {{ dumbScoreLabel[String(item.dumbScore)] }}
              </span>
              <span class="text-[#836BC2] text-sm font-bold shrink-0">{{ item.amount.toLocaleString() }}원</span>
            </div>
          </div>

          <!-- 하단 요약 -->
          <div class="mt-auto pt-2 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p class="text-xs text-gray-500 font-medium">
              아까운 지출을 줄여봐요 💪
            </p>
          </div>
        </div>
      </CarouselItem>
    </CarouselContent>

    <!-- Dot indicator -->
    <CarouselDots class="mt-3" />
  </Carousel>
</template>

<style scoped></style>
