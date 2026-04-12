<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { CarouselItem } from '@/components/ui/carousel/index.js';
import { ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const props = defineProps({
  totalExpense: {
    type: Number,
    required: true,
  },
  totalIncome: {
    type: Number,
    required: true,
  },
  budgetGoal: {
    type: [Number, Object],
    required: true,
  },
  memberCount: {
    type: Number,
    required: true,
  },
});

const spendingLimit = computed(() => {
  if (typeof props.budgetGoal === 'object' && props.budgetGoal !== null) {
    return props.budgetGoal.spendingLimit || 0;
  }
  return props.budgetGoal || 0;
});

const savingGoal = computed(() => {
  if (typeof props.budgetGoal === 'object' && props.budgetGoal !== null) {
    return props.budgetGoal.savingGoal || 0;
  }
  return 0;
});

const spendingPercent = computed(() => {
  if (spendingLimit.value <= 0) return 0;
  return Math.min(
    Math.round((props.totalExpense / spendingLimit.value) * 100),
    100,
  );
});

const savingPercent = computed(() => {
  if (savingGoal.value <= 0) return 0;
  return Math.min(
    Math.round((props.totalIncome / savingGoal.value) * 100),
    100,
  );
});

const isOverBudget = computed(() => props.totalExpense > spendingLimit.value);
const isSavingGoalReached = computed(
  () => savingGoal.value > 0 && props.totalIncome >= savingGoal.value,
);

const remainingDays = computed(() => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
});

const dailyPerPerson = computed(() => {
  const remaining = spendingLimit.value - props.totalExpense;
  if (remaining <= 0) return 0;
  return Math.floor(remaining / remainingDays.value / props.memberCount);
});
</script>

<template>
  <CarouselItem>
    <div
      class="bg-white rounded-2xl p-5 flex flex-col h-75 shadow-sm border border-gray-100"
    >
      <!-- 예산 설정된 경우 -->
      <template v-if="spendingLimit > 0 || savingGoal > 0">
        <!-- 헤더 -->
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-bold text-[#5e5e5e] text-base">
            이번 달 모임 예산 현황
          </h3>
        </div>

        <div class="flex items-center mt-3 flex-1 w-full gap-2">
          <!-- 좌측: 회비통 (지출 한도) -->
          <div class="flex-1 flex flex-col items-center">
            <span class="text-xs font-bold text-gray-600 mb-2">지출 한도</span>
            <template v-if="spendingLimit > 0">
              <div class="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full">
                  <path
                    class="text-gray-100"
                    stroke-width="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    :class="isOverBudget ? 'text-red-500' : 'text-[#836BC2]'"
                    stroke-dasharray="100, 100"
                    :stroke-dashoffset="100 - spendingPercent"
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
                  <span
                    class="text-lg font-bold text-[#191919] tracking-tighter"
                    >{{ spendingPercent
                    }}<span
                      class="text-[10px] font-semibold text-gray-500 ml-0.5"
                      >%</span
                    ></span
                  >
                </div>
              </div>
              <div class="mt-2 flex flex-col items-center text-center">
                <p
                  class="text-[11px] font-bold text-[#191919] truncate max-w-[80px]"
                >
                  {{ totalExpense.toLocaleString() }}원
                </p>
                <p class="text-[9px] text-gray-400 truncate max-w-[80px]">
                  / {{ spendingLimit.toLocaleString() }}원
                </p>
              </div>
            </template>
            <template v-else>
              <div class="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full">
                  <path
                    class="text-gray-200"
                    stroke-width="2"
                    stroke-dasharray="2, 2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <span
                    class="text-[11px] font-bold text-gray-400 tracking-tighter"
                    >미설정</span
                  >
                </div>
              </div>
              <div class="mt-2 flex flex-col items-center text-center">
                <p class="text-[9px] text-gray-400 leading-snug">
                  상세 탭에서<br />설정해주세요
                </p>
              </div>
            </template>
          </div>

          <!-- 중앙 구분선 -->
          <div class="w-px h-24 bg-gray-100"></div>

          <!-- 우측: 목표 금액 (저금통) -->
          <div class="flex-1 flex flex-col items-center">
            <span class="text-xs font-bold text-gray-700 mb-2">목표 금액</span>
            <template v-if="savingGoal > 0">
              <div class="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full">
                  <path
                    class="text-gray-100"
                    stroke-width="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    :class="
                      isSavingGoalReached ? 'text-blue-500' : 'text-emerald-400'
                    "
                    stroke-dasharray="100, 100"
                    :stroke-dashoffset="100 - savingPercent"
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
                  <span
                    class="text-lg font-bold text-[#191919] tracking-tighter"
                    >{{ savingPercent
                    }}<span
                      class="text-[10px] font-semibold text-gray-500 ml-0.5"
                      >%</span
                    ></span
                  >
                </div>
              </div>
              <div class="mt-2 flex flex-col items-center text-center">
                <p
                  class="text-[11px] font-bold text-[#191919] truncate max-w-[80px]"
                >
                  {{ totalIncome.toLocaleString() }}원
                </p>
                <p class="text-[9px] text-gray-400 truncate max-w-[80px]">
                  / {{ savingGoal.toLocaleString() }}원
                </p>
              </div>
            </template>
            <template v-else>
              <div class="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full">
                  <path
                    class="text-gray-200"
                    stroke-width="2"
                    stroke-dasharray="2, 2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <span
                    class="text-[11px] font-bold text-gray-400 tracking-tighter"
                    >미설정</span
                  >
                </div>
              </div>
              <div class="mt-2 flex flex-col items-center text-center">
                <p class="text-[9px] text-gray-400 leading-snug">
                  상세 탭에서<br />설정해주세요
                </p>
              </div>
            </template>
          </div>
        </div>

        <!-- 하단 요약 -->
        <div
          class="mt-auto bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100 flex flex-col gap-1.5"
        >
          <div
            v-if="spendingLimit > 0"
            class="flex justify-center items-center gap-1.5"
          >
            <span
              class="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold text-gray-600 shrink-0"
              >지출</span
            >
            <span
              v-if="isOverBudget"
              class="text-[10px] sm:text-[11px] text-red-500 font-bold truncate"
              >한도를 초과했어요! 🚨</span
            >
            <span
              v-else
              class="text-[10px] sm:text-[11px] text-gray-600 font-medium truncate"
              >남은 {{ remainingDays }}일간 1인당 하루
              <strong class="text-[#836BC2]"
                >{{ dailyPerPerson.toLocaleString() }}원</strong
              >
              가능</span
            >
          </div>
          <div
            v-if="savingGoal > 0"
            class="flex justify-center items-center gap-1.5"
          >
            <span
              class="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold text-gray-600 shrink-0"
              >저축</span
            >
            <span
              v-if="isSavingGoalReached"
              class="text-[10px] sm:text-[11px] text-blue-500 font-bold truncate"
              >목표를 달성했어요! 🎉</span
            >
            <span
              v-else
              class="text-[10px] sm:text-[11px] text-gray-600 font-medium truncate"
              >앞으로
              <strong class="text-emerald-500"
                >{{
                  Math.max(0, savingGoal - totalIncome).toLocaleString()
                }}원</strong
              >
              더 모으면 달성!</span
            >
          </div>
        </div>
      </template>

      <!-- 예산 미설정 -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div class="w-48 h-32 mb-1 relative">
          <svg
            viewBox="0 0 220 155"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full overflow-visible"
          >
            <!-- 동전들 -->
            <g class="animate-float" style="animation-delay: 0s">
              <circle cx="25" cy="35" r="11" fill="#FFD54F" />
              <circle cx="25" cy="35" r="8" fill="#FBC02D" />
              <text
                x="25"
                y="39.5"
                font-size="13"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>
            <g class="animate-float" style="animation-delay: 0.5s">
              <circle cx="10" cy="88" r="13" fill="#FFD54F" />
              <circle cx="10" cy="88" r="9" fill="#FBC02D" />
              <text
                x="10"
                y="93"
                font-size="15"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>
            <g class="animate-float" style="animation-delay: 1s">
              <circle cx="45" cy="120" r="9" fill="#FFD54F" />
              <circle cx="45" cy="120" r="6" fill="#FBC02D" />
              <text
                x="45"
                y="124"
                font-size="10"
                font-weight="bold"
                fill="#FFF"
                text-anchor="middle"
              >
                ₩
              </text>
            </g>

            <!-- 비행기 + 돼지들 -->
            <g class="animate-float" style="animation-delay: 0.2s">
              <!-- 꼬리 날개 -->
              <path d="M 112 44 L 135 44 L 147 64 Z" fill="#6B53A6" />
              <!-- 보조 날개 -->
              <path d="M 52 54 L 74 76 L 47 88 Z" fill="#836BC2" />
              <!-- 동체 -->
              <path
                d="M 62 76 Q 122 50 172 72 Q 178 78 172 84 Q 122 104 62 76"
                fill="#836BC2"
              />
              <!-- 창문 줄 -->
              <path d="M 67 76 Q 122 62 166 76 Q 122 70 67 76" fill="#F4F5F7" />

              <!-- 돼지1 - 조종석 (크게) -->
              <circle cx="122" cy="56" r="19" fill="#f3eeff" />
              <path d="M 107 45 Q 110 34 116 40 Z" fill="#e0ccf5" />
              <path d="M 130 40 Q 136 34 139 45 Z" fill="#e0ccf5" />
              <ellipse cx="129" cy="60" rx="8.5" ry="6" fill="#e0ccf5" />
              <circle cx="127" cy="60" r="1.8" fill="#836BC2" />
              <circle cx="131" cy="60" r="1.8" fill="#836BC2" />
              <circle cx="117" cy="51" r="2.3" fill="#191919" />
              <circle cx="130" cy="51" r="2.3" fill="#191919" />
              <ellipse
                cx="112"
                cy="57"
                rx="3"
                ry="2"
                fill="#fbcfe8"
                opacity="0.8"
              />
              <ellipse
                cx="132"
                cy="57"
                rx="3"
                ry="2"
                fill="#fbcfe8"
                opacity="0.8"
              />

              <!-- 돼지2 - 뒷창문 (작게) -->
              <circle cx="90" cy="67" r="13" fill="#f3eeff" />
              <path d="M 80 58 Q 82 51 86 55 Z" fill="#e0ccf5" />
              <path d="M 95 55 Q 99 51 101 58 Z" fill="#e0ccf5" />
              <ellipse cx="95" cy="70" rx="6" ry="4" fill="#e0ccf5" />
              <circle cx="93.5" cy="70" r="1.3" fill="#836BC2" />
              <circle cx="96.5" cy="70" r="1.3" fill="#836BC2" />
              <circle cx="86" cy="63" r="1.7" fill="#191919" />
              <circle cx="95" cy="63" r="1.7" fill="#191919" />
              <ellipse
                cx="82"
                cy="67"
                rx="2"
                ry="1.3"
                fill="#fbcfe8"
                opacity="0.8"
              />

              <!-- 앞 날개 -->
              <path d="M 92 84 L 126 84 L 106 116 L 82 116 Z" fill="#836BC2" />
              <path
                d="M 82 116 L 106 116 L 111 110 L 87 110 Z"
                fill="#6B53A6"
              />

              <!-- 프로펠러 -->
              <ellipse cx="172" cy="78" rx="4.5" ry="9" fill="#94A3B8" />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 172 78"
                  to="360 172 78"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
                <ellipse
                  cx="172"
                  cy="56"
                  rx="3"
                  ry="20"
                  fill="#CBD5E1"
                  opacity="0.7"
                />
                <ellipse
                  cx="172"
                  cy="100"
                  rx="3"
                  ry="20"
                  fill="#CBD5E1"
                  opacity="0.7"
                />
              </g>
            </g>
          </svg>
        </div>
        <h3 class="text-base font-bold text-[#191919] mb-1">
          그룹 예산을 설정해보세요!
        </h3>
        <p class="text-xs text-gray-500 mb-3 leading-relaxed">
          그룹 예산을 설정하면<br />1인당 하루 권장 지출액을 알려드려요.
        </p>
        <button
          @click="router.push('/group')"
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
