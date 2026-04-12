<script setup>
import { ref, computed } from 'vue';
import { CarouselItem } from '@/components/ui/carousel/index.js';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';

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
  return Math.max(1, lastDay - now.getDate() + 1);
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
          <h3 class="font-bold text-[#191919] text-base">
            🎯 이번 달 예산 현황
          </h3>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-md"
            :class="
              isOverBudget
                ? 'bg-red-50 text-red-500'
                : 'bg-[#836BC2]/10 text-[#836BC2]'
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
                  :class="isOverBudget ? 'text-red-500' : 'text-emerald-400'"
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
                <span class="text-2xl font-bold text-[#191919] tracking-tighter"
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
                  :class="isOverBudget ? 'text-red-500' : 'text-[#836BC2]'"
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
            <strong class="text-[#836BC2] text-sm"
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
        <!-- 비행기 타는 돼지와 금화 SVG 애니메이션 -->
        <div class="w-48 h-32 mb-2 relative">
          <svg
            viewBox="0 0 200 150"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full overflow-visible"
          >
            <!-- 흩날리는 금색 동전들 -->
            <g class="animate-float" style="animation-delay: 0s">
              <circle cx="30" cy="40" r="10" fill="#FFD54F" />
              <circle cx="30" cy="40" r="7" fill="#FBC02D" />
              <text
                x="30"
                y="44"
                font-size="12"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>
            <g class="animate-float" style="animation-delay: 0.5s">
              <circle cx="15" cy="90" r="12" fill="#FFD54F" />
              <circle cx="15" cy="90" r="8" fill="#FBC02D" />
              <text
                x="15"
                y="94.5"
                font-size="14"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>
            <g class="animate-float" style="animation-delay: 1s">
              <circle cx="50" cy="120" r="8" fill="#FFD54F" />
              <circle cx="50" cy="120" r="5" fill="#FBC02D" />
              <text
                x="50"
                y="123"
                font-size="9"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>

            <!-- 비행기를 탄 돼지 -->
            <g class="animate-float" style="animation-delay: 0.2s">
              <!-- 꼬리 날개 -->
              <path d="M 110 50 L 130 50 L 140 65 Z" fill="#6B53A6" />
              <path d="M 50 55 L 70 75 L 45 85 Z" fill="#836BC2" />

              <!-- 비행기 몸통 -->
              <path
                d="M 60 75 Q 120 50 165 70 Q 170 75 165 80 Q 120 100 60 75"
                fill="#836BC2"
              />
              <path d="M 65 75 Q 120 60 160 75 Q 120 68 65 75" fill="#F4F5F7" />

              <!-- 조종석의 돼지 -->
              <circle cx="115" cy="55" r="16" fill="#f3eeff" />
              <path d="M 102 45 Q 105 35 110 40 Z" fill="#e0ccf5" />
              <path d="M 120 40 Q 125 35 128 45 Z" fill="#e0ccf5" />
              <ellipse cx="122" cy="58" rx="7" ry="5" fill="#e0ccf5" />
              <circle cx="120" cy="58" r="1.5" fill="#836BC2" />
              <circle cx="124" cy="58" r="1.5" fill="#836BC2" />
              <circle cx="114" cy="51" r="2" fill="#191919" />
              <circle cx="126" cy="51" r="2" fill="#191919" />
              <ellipse
                cx="110"
                cy="56"
                rx="2.5"
                ry="1.5"
                fill="#fbcfe8"
                opacity="0.8"
              />

              <!-- 앞 날개 -->
              <path d="M 90 80 L 120 80 L 100 110 L 80 110 Z" fill="#836BC2" />
              <path
                d="M 80 110 L 100 110 L 105 105 L 85 105 Z"
                fill="#6B53A6"
              />

              <!-- 회전하는 프로펠러 -->
              <ellipse cx="165" cy="75" rx="4" ry="8" fill="#94A3B8" />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 165 75"
                  to="360 165 75"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
                <ellipse
                  cx="165"
                  cy="55"
                  rx="3"
                  ry="18"
                  fill="#CBD5E1"
                  opacity="0.7"
                />
                <ellipse
                  cx="165"
                  cy="95"
                  rx="3"
                  ry="18"
                  fill="#CBD5E1"
                  opacity="0.7"
                />
              </g>
            </g>
          </svg>
        </div>
        <h3 class="text-base font-bold text-[#191919] mb-1.5">
          이번 달 예산을 설정해보세요!
        </h3>
        <p class="text-xs text-gray-500 mb-6 leading-relaxed">
          목표 예산을 설정하면<br />하루 권장 지출액을 알려드려요.
        </p>
        <button
          @click="router.push('/mypage')"
          class="flex items-center justify-center gap-1.5 bg-[#836BC2]/10 text-[#836BC2] text-sm font-bold py-2.5 px-5 rounded-2xl hover:bg-[#836BC2]/20 transition active:scale-95"
        >
          예산 설정하러 가기
          <ChevronRight class="w-5 h-5 text-[#836BC2]" />
        </button>
      </div>
    </div>
  </CarouselItem>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
