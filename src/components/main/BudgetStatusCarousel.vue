<script setup>
import { ref, computed } from 'vue';
import { CarouselItem } from '@/components/ui/carousel/index.js';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  totalExpense: {
    type: Number,
    required: true,
  },
  budgetGoal: {
    type: Number,
    required: true,
  },
});

const budgetUsagePercent = computed(() => {
  if (props.budgetGoal <= 0) return 0;
  const percent = (props.totalExpense / props.budgetGoal) * 100;
  return Math.min(percent, 100);
});

const isOverBudget = computed(() => props.totalExpense > props.budgetGoal);

const remainingDays = computed(() => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate());
});
</script>

<template>
  <CarouselItem>
    <div
      class="bg-white rounded-2xl p-5 flex flex-col h-75 shadow-sm border border-gray-100"
    >
      <!-- 예산이 설정된 경우 (기존 UI) -->
      <template v-if="budgetGoal > 0">
        <!-- 헤더 -->
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-bold text-gray-800 text-base">
            🎯 이번 달 예산 현황
          </h3>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-md"
            :class="
              isOverBudget
                ? 'bg-red-50 text-red-500'
                : 'bg-purple-50 text-purple-600'
            "
          >
            {{ isOverBudget ? '예산 초과' : '순항 중' }}
          </span>
        </div>

        <div class="flex items-center mt-2 flex-1 w-full">
          <!-- 좌측: 원형 그래프 (왼쪽 영역의 가운데 정렬) -->
          <div class="flex-1 flex justify-center">
            <div class="relative w-30 h-30 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full transform rotate-0">
                <!-- 배경 원 -->
                <path
                  class="text-gray-100"
                  stroke-width="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- 진행률 원 -->
                <path
                  :class="isOverBudget ? 'text-red-500' : 'text-purple-500'"
                  stroke-dasharray="100, 100"
                  :stroke-dashoffset="100 - budgetUsagePercent"
                  stroke-linecap="round"
                  stroke-width="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <div
                class="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="text-2xl font-bold text-gray-800 tracking-tighter"
                  >{{ Math.round(budgetUsagePercent)
                  }}<span class="text-xs font-semibold text-gray-500 ml-0.5"
                    >%</span
                  ></span
                >
              </div>
            </div>
          </div>

          <!-- 우측: 예산 상세 정보 (오른쪽 영역의 왼쪽 정렬) -->
          <div class="flex-1 flex justify-start pl-2">
            <div class="flex flex-col gap-3">
              <div>
                <p class="text-[10px] font-medium text-gray-400 mb-0.5">
                  목표 예산
                </p>
                <p class="text-sm font-semibold text-gray-700">
                  {{ budgetGoal.toLocaleString() }}원
                </p>
              </div>
              <div>
                <p class="text-[10px] font-medium text-gray-400 mb-0.5">
                  현재 지출
                </p>
                <p
                  class="text-sm font-bold"
                  :class="isOverBudget ? 'text-red-500' : 'text-purple-600'"
                >
                  {{ totalExpense.toLocaleString() }}원
                </p>
              </div>
              <div>
                <p class="text-[10px] font-medium text-gray-400 mb-0.5">
                  남은 예산
                </p>
                <p class="text-sm font-semibold text-gray-700">
                  {{
                    Math.max(0, budgetGoal - totalExpense).toLocaleString()
                  }}원
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 요약 메시지 -->
        <div
          class="mt-auto bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
        >
          <p v-if="isOverBudget" class="text-xs text-red-500 font-bold">
            앗, 목표 예산을 초과했어요! 🚨
          </p>
          <p v-else class="text-xs text-gray-500 font-medium tracking-tight">
            남은 {{ remainingDays }}일 동안 하루
            <strong class="text-purple-600 text-sm"
              >{{
                Math.floor(
                  (budgetGoal - totalExpense) / remainingDays,
                ).toLocaleString()
              }}원</strong
            >씩 쓸 수 있어요
          </p>
        </div>
      </template>

      <!-- 예산을 설정하지 않은 경우 (Empty State) -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div
          class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner"
        >
          🎯
        </div>
        <h3 class="text-base font-bold text-gray-800 mb-1.5">
          이번 달 예산을 설정해보세요!
        </h3>
        <p class="text-xs text-gray-500 mb-6 leading-relaxed">
          목표 예산을 설정하면<br />하루 권장 지출액을 알려드려요.
        </p>
        <button
          @click="router.push('/mypage')"
          class="bg-violet-600 text-white text-sm font-semibold py-2.5 px-6 rounded-full shadow-md hover:bg-violet-700 transition active:scale-95"
        >
          예산 설정하러 가기
        </button>
      </div>
    </div>
  </CarouselItem>
</template>

<style lang="scss" scoped></style>
