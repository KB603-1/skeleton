<script setup>
import { useRouter } from 'vue-router';
import Card from '@/components/ui/card/Card.vue';
import RecentTransactions from '@/components/main/RecentTransactions.vue';
import { useRecordStore } from '@/stores/record';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import GroupInfo from '@/components/GroupInfo.vue';
import MyInfo from '@/components/MyInfo.vue';
import FloatingActionButton from '@/components/FloatingActionButton.vue';

const router = useRouter();
const recordStore = useRecordStore();
const { expenses } = storeToRefs(recordStore);

const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1);
const lastYear = lastMonthDate.getFullYear();
const lastMonth = lastMonthDate.getMonth();

const monthTotalExpenses = computed(() =>
  getMonthSum(currentMonth, currentYear),
);

const lastMonthTotalExpenses = computed(() => getMonthSum(lastMonth, lastYear));

const lastMonthResult = computed(() => {
  if (lastMonthTotalExpenses.value === 0) return { hasData: false };

  const percent = Math.round(
    ((lastMonthTotalExpenses.value - monthTotalExpenses.value) /
      lastMonthTotalExpenses.value) *
      100,
  );
  return { hasData: true, percent };
});

// 소비 유형
const SPENDING_TYPES = {
  식비: { label: '식도락가형', emoji: '🍽️', desc: '맛있는 걸 아는 당신!' },
  교통비: { label: '이동왕형', emoji: '🚌', desc: '어디든 달려가는 당신!' },
  문화생활: { label: '문화인형', emoji: '🎭', desc: '삶의 여유를 아는 당신!' },
};

const spendingType = computed(() => {
  if (expenses.value.length === 0) return null;
  const totals = {};
  for (const e of expenses.value) {
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

const getMonthSum = (month, year) =>
  expenses.value
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((acc, e) => acc + e.amount, 0);
</script>

<template>
  <!-- 총 지출 카드 -->
  <div
    @click="router.push('/stats')"
    class="mx-5 rounded-2xl bg-linear-to-br from-purple-500 to-purple-700 p-5 shadow-lg relative overflow-hidden cursor-pointer"
  >
    <div
      class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-400/30"
    ></div>
    <div
      class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-purple-400/20"
    ></div>
    <p class="text-purple-200 text-sm">{{ currentMonth + 1 }}월 총 지출</p>
    <h1 class="text-white text-4xl font-bold mt-1">
      {{ monthTotalExpenses.toLocaleString()
      }}<span class="text-2xl font-semibold">원</span>
    </h1>
    <div
      class="mt-3 inline-flex items-center gap-1.5 bg-purple-600/50 rounded-full px-3 py-1 text-white text-xs"
    >
      <span v-if="!lastMonthResult.hasData" class="text-green-300 font-semibold"
        >지난 달 데이터가 없어요!</span
      >
      <span
        v-else-if="lastMonthResult.percent > 0"
        class="text-green-300 font-semibold"
        >지난 달 대비 ▼ {{ lastMonthResult.percent }}% 절약</span
      >
      <span v-else class="text-green-300 font-semibold"
        >지난 달 대비 ▲ {{ Math.abs(lastMonthResult.percent) }}% 증가</span
      >
    </div>
  </div>

  <!-- 동기부여 카드 -->
  <Card
    class="mx-5 mt-3 rounded-2xl border-0 px-4 py-3.5 gap-0 flex-row items-center shadow-sm"
  >
    <div
      class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0"
    >
      ✨
    </div>
    <div class="flex-1">
      <p class="text-sm font-semibold text-gray-800">잘 기록하고 있어요!</p>
      <p class="text-xs text-gray-400 mt-0.5">
        꾸준한 기록이 최고의 절약이에요
      </p>
    </div>
    <span class="text-purple-400 text-lg">✦</span>
  </Card>

  <!-- 개인 모드: 소비 유형 카드 -->
  <MyInfo v-if="!currentGroup" />

  <!-- 모임 모드: 캐러셀 (shadcn Carousel + embla) -->
  <GroupInfo v-if="currentGroup" />

  <!-- 최근 내역 -->
  <RecentTransactions />

  <!-- 우측 하단 플로팅 액션 버튼 (FAB) -->
  <FloatingActionButton />
</template>
