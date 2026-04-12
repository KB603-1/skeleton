<script setup>
import { computed } from 'vue';
import { CarouselItem } from '@/components/ui/carousel/index.js';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const props = defineProps({
  totalExpense: {
    type: Number,
    required: true,
  },
  groupedRecord: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const memberCount = computed(() => Object.keys(props.groupedRecord).length || 1);

const myExpense = computed(() => {
  if (!user.value) return 0;
  return props.groupedRecord[user.value.id]?.totalExpense ?? 0;
});

const myPercent = computed(() => {
  if (props.totalExpense <= 0) return 0;
  return Math.min(Math.round((myExpense.value / props.totalExpense) * 100), 100);
});

const avgExpense = computed(() =>
  Math.floor(props.totalExpense / memberCount.value),
);
</script>

<template>
  <CarouselItem>
    <div class="bg-white rounded-2xl p-5 flex flex-col h-75 shadow-sm border border-gray-100">
      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-1">
        <h3 class="font-bold text-[#191919] text-base">👥 이번 달 그룹 현황</h3>
        <span class="text-[10px] font-bold px-2 py-1 rounded-md bg-[#836BC2]/10 text-[#836BC2]">
          멤버 {{ memberCount }}명
        </span>
      </div>

      <div class="flex items-center mt-2 flex-1 w-full">
        <!-- 좌측: 원형 그래프 -->
        <div class="flex-1 flex justify-center">
          <div class="relative w-30 h-30 shrink-0">
            <svg viewBox="0 0 36 36" class="w-full h-full">
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
                class="text-emerald-400 transition-all duration-1000 ease-out"
                stroke-dasharray="100, 100"
                :stroke-dashoffset="100 - myPercent"
                stroke-linecap="round"
                stroke-width="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-[#191919] tracking-tighter">
                {{ myPercent }}<span class="text-xs font-semibold text-gray-500 ml-0.5">%</span>
              </span>
              <span class="text-[9px] text-gray-400 mt-0.5">내 기여도</span>
            </div>
          </div>
        </div>

        <!-- 우측: 지출 상세 정보 -->
        <div class="flex-1 flex justify-start pl-2">
          <div class="flex flex-col gap-3">
            <div>
              <p class="text-[10px] font-medium text-gray-400 mb-0.5">그룹 총 지출</p>
              <p class="text-sm font-semibold text-gray-700">
                {{ totalExpense.toLocaleString() }}원
              </p>
            </div>
            <div>
              <p class="text-[10px] font-medium text-gray-400 mb-0.5">내 지출</p>
              <p class="text-sm font-bold text-[#836BC2]">
                {{ myExpense.toLocaleString() }}원
              </p>
            </div>
            <div>
              <p class="text-[10px] font-medium text-gray-400 mb-0.5">1인당 평균</p>
              <p class="text-sm font-semibold text-gray-700">
                {{ avgExpense.toLocaleString() }}원
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 요약 -->
      <div class="mt-auto bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
        <p v-if="totalExpense === 0" class="text-xs text-gray-400 font-medium">
          아직 이번 달 지출 내역이 없어요
        </p>
        <p v-else class="text-xs text-gray-500 font-medium tracking-tight">
          멤버 <strong class="text-[#836BC2] text-sm">{{ memberCount }}명</strong>이
          함께 <strong class="text-[#836BC2] text-sm">{{ totalExpense.toLocaleString() }}원</strong> 지출했어요
        </p>
      </div>
    </div>
  </CarouselItem>
</template>
