<script setup>

import {Carousel, CarouselContent, CarouselDots, CarouselItem} from "@/components/ui/carousel/index.js";
import {computed} from "vue";
import {useRecordStore} from "@/stores/record.js";

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

    if (record.type === "income") {
      totalIncome += record.amount;
      grouped[userId].totalIncome += record.amount;
    } else {
      totalExpense += record.amount;
      grouped[userId].totalExpense += record.amount;
    }
  }

  return {totalIncome, totalExpense, groupedRecord: grouped};
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
    if (record.type !== "expense") continue;

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
  <Carousel
      class="mx-5 mt-3"
      :opts="{ align: 'center', containScroll: false }"
  >
    <CarouselContent class="gap-3">

      <CarouselItem>
        <div class="bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col h-[300px]">

          <!-- 헤더 -->
          <span
              class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-3">
      📊 모임 현황
    </span>

          <!-- 남은 예산 -->
          <p class="text-purple-200 text-sm">남은 예산</p>
          <p
              class="text-3xl font-bold mt-1"
              :class="(summary.totalIncome - summary.totalExpense) >= 0 ? 'text-white' : 'text-red-300'"
          >
            {{
              (summary.totalIncome - summary.totalExpense).toLocaleString()
            }}
            <span class="text-xl font-semibold"> 원</span>
          </p>

          <!-- 수입/지출 -->
          <p class="text-purple-200 text-xs mt-1">
            수입: {{ summary.totalIncome.toLocaleString() }}원 ·
            지출: {{ summary.totalExpense.toLocaleString() }}원
          </p>

          <!-- progress bar -->
          <div class="w-full h-2 rounded-full mt-2 overflow-hidden flex">

            <!-- 수입 -->
            <div
                class="bg-blue-300 h-full"
                :style="{
      width: (summary.totalIncome + summary.totalExpense)
        ? (summary.totalIncome / (summary.totalIncome + summary.totalExpense)) * 100 + '%'
        : '50%'
    }"
            ></div>

            <!-- 지출 -->
            <div
                class="bg-red-300 h-full"
                :style="{
      width: (summary.totalIncome + summary.totalExpense)
        ? (summary.totalExpense / (summary.totalIncome + summary.totalExpense)) * 100 + '%'
        : '50%'
    }"
            ></div>
          </div>

          <!-- 카테고리 -->
          <div class="mt-3">
            <p class="text-purple-200 text-sm mb-1">지출 Top 3</p>
            <div v-if="top3CategoryExpense.length > 0" class="flex gap-2 flex-1 items-end">
              <div v-for="(item, index) in top3CategoryExpense" :key="item.category?.id"
                   class="flex-1 bg-purple-400/30 rounded-xl py-2.5 flex flex-col items-center"><span
                  class="text-lg mb-1.5">{{ item.category.icon }}</span> <span
                  class="text-purple-200 text-xs">{{ item.category.name }}</span> <span
                  class="text-white text-sm font-bold mt-0.5"> {{
                  summary?.totalExpense ? ((item.totalExpense / summary.totalExpense) * 100).toFixed(1) : 0
                }}%</span></div>
            </div>
            <div v-else class="flex items-center justify-center py-4 text-white/70 text-sm">
              데이터가 없습니다
            </div>
          </div>

        </div>
      </CarouselItem>
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
            {{ dumbTotal.toLocaleString() }}<span class="text-xl font-semibold">원</span>
          </p>
          <div class="flex flex-col gap-2">
            <div v-if="dumbExpenses.length === 0" class="flex items-center justify-center flex-1 text-white/70 text-sm">
              이번 달 멍청 비용이 없어요 🎉
            </div>
            <div
                v-for="item in dumbExpenses"
                :key="item.id"
                class="flex items-center bg-purple-400/30 rounded-xl px-3 py-2.5"
            >
              <span class="text-lg mr-2.5 shrink-0">{{ item.category?.icon }}</span>
              <span class="flex-1 text-white text-sm font-medium min-w-0 truncate mr-2">{{ item.title }}</span>
              <span class="bg-purple-300/30 text-purple-100 text-xs px-2 py-0.5 rounded-full mr-2 shrink-0">
                {{ dumbScoreLabel[String(item.dumbScore)] }}
              </span>
              <span class="text-white text-sm font-bold shrink-0">{{ item.amount.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </CarouselItem>
    </CarouselContent>

    <!-- Dot indicator -->
    <CarouselDots class="mt-3"/>
  </Carousel>
</template>

<style scoped>

</style>