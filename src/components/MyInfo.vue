<script setup>
import { computed } from 'vue';
import { useRecordStore } from '@/stores/record';
import { storeToRefs } from 'pinia';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel/index.js';
import BudgetStatusCarousel from './main/BudgetStatusCarousel.vue';
import { useUserStore } from '@/stores/user';

const recordStore = useRecordStore();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { expenses } = storeToRefs(recordStore);

const SPENDING_TYPES = {
  식비: { label: '식도락가형', emoji: '🍽️', desc: '맛있는 걸 아는 당신!' },
  생활비: { label: '생활충실형', emoji: '🏠', desc: '알차게 사는 당신!' },
  '주거/통신': {
    label: '홈마스터형',
    emoji: '📡',
    desc: '편안한 집을 사랑하는 당신!',
  },
  '교통/차량': {
    label: '이동왕형',
    emoji: '🚗',
    desc: '어디든 달려가는 당신!',
  },
  '쇼핑/뷰티': {
    label: '쇼핑킹형',
    emoji: '🛍️',
    desc: '아름다움을 아는 당신!',
  },
  '문화/여가': {
    label: '문화인형',
    emoji: '🎭',
    desc: '삶의 여유를 아는 당신!',
  },
  '건강/의료': {
    label: '건강지킴이형',
    emoji: '💊',
    desc: '건강을 챙기는 당신!',
  },
  기타: { label: '자유영혼형', emoji: '✨', desc: '나만의 길을 가는 당신!' },
};

const currentMonthExpenses = computed(() => {
  const now = new Date();
  return expenses.value.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });
});

// 총 지출 계산
const totalExpense = computed(() => {
  return currentMonthExpenses.value.reduce((sum, e) => sum + e.amount, 0);
});

const spendingType = computed(() => {
  if (currentMonthExpenses.value.length === 0) return null;
  const totals = {};
  for (const e of currentMonthExpenses.value) {
    const name = e.category?.name ?? '기타';
    totals[name] = (totals[name] ?? 0) + e.amount;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  return (
    SPENDING_TYPES[top] ?? {
      label: '절약가형',
      emoji: '💰',
      desc: '알뜰살뜰 당신!',
    }
  );
});
</script>

<template>
  <Carousel class="mx-5 mt-3" :opts="{ align: 'center', containScroll: false }">
    <CarouselContent class="gap-3">
      <!-- 새로 추가한 예산 현황 아이템 -->
      <BudgetStatusCarousel
        :totalExpense="totalExpense"
        :budgetGoal="user?.budgetGoal || 0"
      />

      <CarouselItem>
        <div class="bg-white rounded-2xl p-5 flex flex-col h-75 shadow-sm border border-gray-100">
          <!-- 헤더 -->
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-bold text-[#191919] text-base">✨ 나의 소비 유형</h3>
            <span class="text-[10px] font-bold px-2 py-1 rounded-md bg-[#836BC2]/10 text-[#836BC2]">
              이번 달
            </span>
          </div>

          <!-- 소비 유형 있을 때 -->
          <template v-if="spendingType">
            <div class="flex items-center gap-4 mt-4">
              <div class="w-16 h-16 rounded-2xl bg-[#836BC2]/10 flex items-center justify-center text-4xl shrink-0">
                {{ spendingType.emoji }}
              </div>
              <div>
                <p class="text-[#191919] text-xl font-bold">{{ spendingType.label }}</p>
                <p class="text-gray-500 text-sm mt-1">{{ spendingType.desc }}</p>
              </div>
            </div>

            <div class="mt-auto bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p class="text-xs text-gray-500 font-medium">
                이번 달 가장 많이 쓴 카테고리를 기반으로 분석했어요.
              </p>
            </div>
          </template>

          <!-- 소비 유형 없을 때 -->
          <div v-else class="flex flex-col items-center justify-center flex-1 text-center">
            <p class="text-gray-400 text-sm">아직 지출 내역이 없어요</p>
            <p class="text-gray-700 font-semibold mt-1">기록을 시작해보세요! 📝</p>
          </div>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselDots class="mt-3" />
  </Carousel>
</template>

<style scoped></style>
