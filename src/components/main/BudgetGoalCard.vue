<script setup>
import { ref, computed, watch, onMounted, onActivated } from 'vue';
import { useRecordStore } from '@/stores/record';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();
const recordStore = useRecordStore();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { expenses } = storeToRefs(recordStore);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const today = now.getDate();
const daysInMonth = new Date(year, month, 0).getDate();
const daysLeft = Math.max(daysInMonth - today + 1, 1);
const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

function budgetKey() {
  return `personal_budget_${user.value?.id}_${year}_${String(month).padStart(2, '0')}`;
}

const budget = ref(0);

function loadBudget() {
  if (user.value) budget.value = Number(localStorage.getItem(budgetKey())) || 0;
}

// 최초 로드 + 유저 변경 시
watch(user, loadBudget, { immediate: true });
// KeepAlive로 캐시된 페이지에서 돌아올 때마다 재읽기
onMounted(loadBudget);
onActivated(loadBudget);

const monthSpent = computed(() =>
  expenses.value
    .filter((e) => e.date?.slice(0, 7) === monthPrefix)
    .reduce((s, e) => s + e.amount, 0),
);

const remaining = computed(() => budget.value - monthSpent.value);
const percent = computed(() =>
  budget.value > 0 ? Math.round((monthSpent.value / budget.value) * 100) : 0,
);
const safeDaily = computed(() =>
  remaining.value > 0 ? Math.floor(remaining.value / daysLeft) : 0,
);

const info = computed(() => {
  if (budget.value === 0) {
    return {
      emoji: '🎯',
      main: '이번 달 예산 목표가 없어요',
      sub: '마이페이지에서 설정하면 오늘 쓸 수 있는 금액을 알려드려요!',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      bar: null,
    };
  }
  const p = percent.value;
  if (p > 100) {
    return {
      emoji: '😅',
      main: '이미 예산을 넘었지만.. 괜찮아요!',
      sub: '기록하는 게 어디예요? 🥲',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      bar: 'bg-rose-400',
    };
  }
  if (p >= 80) {
    return {
      emoji: '⚠️',
      main: '남은 돈이 얼마 없어요..',
      sub: '오늘은 커피 한 잔만 참아볼까요? ☕',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      bar: 'bg-amber-400',
    };
  }
  if (p >= 50) {
    return {
      emoji: '👍',
      main: '이번 달 예산이 절반이나 남았어요.',
      sub: `오늘은 ${safeDaily.value.toLocaleString()}원까지 써도 안전해요!`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      bar: 'bg-emerald-400',
    };
  }
  return {
    emoji: '✨',
    main: `오늘은 ${safeDaily.value.toLocaleString()}원까지 써도 안전해요!`,
    sub: '이번 달 예산이 아직 넉넉해요 💪',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-400',
  };
});
</script>

<template>
  <div
    class="mx-5 mt-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
    @click="router.push('/mypage')"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
      :class="info.bg"
    >
      {{ info.emoji }}
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-800 leading-snug">{{ info.main }}</p>
      <p class="text-xs text-gray-400 mt-0.5 leading-snug">{{ info.sub }}</p>

      <div v-if="budget > 0" class="mt-2">
        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full transition-all duration-700"
            :class="info.bar"
            :style="{ width: Math.min(percent, 100) + '%' }"
          ></div>
        </div>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {{ monthSpent.toLocaleString() }}원 / {{ budget.toLocaleString() }}원 ({{ percent }}%)
        </p>
      </div>
    </div>

    <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</template>
