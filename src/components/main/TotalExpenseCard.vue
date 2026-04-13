<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRecordStore } from '@/stores/record';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';
import { ChevronRight } from 'lucide-vue-next';
import PigIcon from '@/components/PigIcon.vue';

const router = useRouter();
const recordStore = useRecordStore();
const groupStore = useGroupStore();
const { records } = storeToRefs(recordStore);
const { currentGroup } = storeToRefs(groupStore);

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const currentMonthRecords = computed(() => {
  if (!records.value) return [];
  return records.value.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
});

const monthIncome = computed(() =>
  currentMonthRecords.value
    .filter((r) => r.type === 'income')
    .reduce((acc, r) => acc + r.amount, 0),
);

const monthExpense = computed(() =>
  currentMonthRecords.value
    .filter((r) => r.type === 'expense')
    .reduce((acc, r) => acc + r.amount, 0),
);

const remainingAmount = computed(() => monthIncome.value - monthExpense.value);

const perPersonExpense = computed(() => {
  if (!currentGroup.value) return 0;
  const memberCount = currentGroup.value.members?.length || 1;
  return Math.floor(monthExpense.value / memberCount);
});

const pigVariant = computed(() => {
  if (remainingAmount.value < 0) return 'panic';
  if (remainingAmount.value > 0) return 'happy';
  return 'normal';
});
</script>

<template>
  <div class="mx-5 flex gap-3 items-stretch">
    <!-- 좌측: 공통 총 지출 메인 카드 -->
    <div
      @click="router.push('/stats')"
      class="flex-1 rounded-2xl bg-[#836BC2] p-5 shadow-lg relative overflow-hidden cursor-pointer flex flex-col justify-center"
    >
      <!-- 우측 상단/하단 원형 배경 -->
      <div
        class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20"
      ></div>
      <div
        class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-white/10"
      ></div>

      <!-- 돼지 저금통 & 떨어지는 동전 애니메이션 영역 -->
      <div
        class="absolute bottom-0 right-0 w-28 h-28 opacity-95 pointer-events-none translate-y-1 translate-x-1 scale-[0.8] sm:translate-y-2 sm:translate-x-2 sm:scale-95 origin-bottom-right transition-transform"
      >
        <!-- 은색 동전 -->
        <div
          v-if="remainingAmount >= 0"
          class="absolute right-[2.8rem] -top-1 animate-coin-drop"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="13" cy="13" r="12" fill="#CBD5E1" />
            <circle
              cx="13"
              cy="13"
              r="12"
              fill="url(#coinGrad)"
              stroke="#94A3B8"
              stroke-width="0.8"
            />
            <circle
              cx="13"
              cy="13"
              r="9"
              fill="none"
              stroke="#94A3B8"
              stroke-width="0.6"
              opacity="0.5"
            />
            <text
              x="13"
              y="17.5"
              text-anchor="middle"
              font-size="12"
              font-weight="bold"
              fill="#64748B"
              font-family="Arial, sans-serif"
            >
              $
            </text>
            <defs>
              <radialGradient id="coinGrad" cx="40%" cy="35%">
                <stop offset="0%" stop-color="#F1F5F9" />
                <stop offset="100%" stop-color="#CBD5E1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <!-- 돼지 이미지 -->
        <div class="w-full h-full animate-pig-bounce">
          <PigIcon
            :variant="pigVariant"
            eye-color="#5b21b6"
            nose-spot-color="#9333ea"
            :show-ear-tag="false"
          />
        </div>
      </div>

      <p class="text-purple-200 text-sm relative z-10 font-medium">
        이번 달 남은 금액
      </p>
      <h1
        class="text-white font-bold mt-1 relative z-10 truncate"
        :class="currentGroup ? 'text-3xl' : 'text-4xl'"
      >
        {{ remainingAmount.toLocaleString() }}
        <span
          class="font-semibold"
          :class="currentGroup ? 'text-xl' : 'text-2xl'"
          >원</span
        >
      </h1>

      <div class="mt-3 flex flex-col gap-1.5 relative z-10 w-fit">
        <div
          class="flex items-center gap-1.5 bg-black/10 rounded-md px-2 py-1 border border-white/5 backdrop-blur-sm"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]"
          ></span>
          <span class="text-[10px] font-medium text-white/80">수입</span>
          <span class="text-xs font-bold text-white ml-1"
            >{{ monthIncome.toLocaleString() }}원</span
          >
        </div>
        <div
          class="flex items-center gap-1.5 bg-black/10 rounded-md px-2 py-1 border border-white/5 backdrop-blur-sm"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_4px_rgba(251,113,133,0.5)]"
          ></span>
          <span class="text-[10px] font-medium text-white/80">지출</span>
          <span class="text-xs font-bold text-white ml-1"
            >{{ monthExpense.toLocaleString() }}원</span
          >
        </div>
      </div>
    </div>

    <!-- 우측: 모임 상세 요약 카드 (모임 모드일 때만 표시) -->
    <div
      v-if="currentGroup"
      @click="router.push('/group')"
      class="rounded-2xl bg-white shadow-sm flex cursor-pointer border border-purple-50 transition hover:shadow-md relative z-10 shrink-0 w-16 flex-col items-center justify-center py-3 gap-2 sm:w-auto sm:min-w-[8rem] sm:flex-row sm:justify-between sm:p-4 sm:gap-4"
    >
      <!-- 좌측 정보 영역 (모바일: 아이콘만 / 넓은 화면: 아이콘 + 예상 금액) -->
      <div class="flex flex-col items-center sm:items-start">
        <div
          class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-base shrink-0"
        >
          {{ currentGroup.icon || '🏠' }}
        </div>

        <div class="hidden sm:block mt-2">
          <p class="text-xs font-medium text-gray-400">1인당 지출</p>
          <p
            class="text-sm font-extrabold text-gray-800 tracking-tight mt-0.5 truncate"
          >
            {{ perPersonExpense.toLocaleString()
            }}<span class="text-xs font-medium ml-0.5 text-gray-500">원</span>
          </p>
        </div>
      </div>

      <!-- 우측(하단) 화살표 아이콘 -->
      <ChevronRight class="w-6 h-6 text-gray-400" />
    </div>
  </div>
</template>

<style scoped>
/* 동전이 위에서 떨어지는 애니메이션 */
@keyframes coinDrop {
  0% {
    transform: translateY(-40px) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translateY(-10px) scale(1);
    opacity: 1;
  }
  70% {
    transform: translateY(30px) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(40px) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translateY(40px) scale(0.5);
    opacity: 0;
  }
}

/* 돼지가 동전을 받을 때 흔들거리는 애니메이션 */
@keyframes pigBounce {
  0%,
  70%,
  100% {
    transform: scale(1) translateY(0);
  }
  75% {
    transform: scaleY(0.9) scaleX(1.05) translateY(4px);
  }
  85% {
    transform: scaleY(1.05) scaleX(0.95) translateY(-2px);
  }
}

.animate-coin-drop {
  animation: coinDrop 2.5s infinite;
}

.animate-pig-bounce {
  animation: pigBounce 2.5s infinite;
  transform-origin: bottom center;
}
</style>
