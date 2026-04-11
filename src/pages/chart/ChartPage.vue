<script setup>
import {
  VisSingleContainer,
  VisDonut,
  VisXYContainer,
  VisGroupedBar,
  VisAxis,
} from '@unovis/vue';
import {
  ChartContainer,
  ChartTooltip,
  ChartCrosshair,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart';
import { useRecordStore } from '@/stores/record';
import { useGroupStore } from '@/stores/group';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onActivated } from 'vue';

const DEFAULT_COLORS = [
  '#a78bfa',
  '#f472b6',
  '#60a5fa',
  '#34d399',
  '#fb923c',
  '#e879f9',
  '#fbbf24',
  '#f87171',
];

const recordStore = useRecordStore();
const { expenses, expenseCategories } = storeToRefs(recordStore);

const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

const userStore = useUserStore();
const { user: currentUser } = storeToRefs(userStore);

onMounted(() => {
  recordStore.fetchRecord();
  recordStore.fetchCategories();
});

onActivated(() => {
  recordStore.fetchRecord();
  recordStore.fetchCategories();
});

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();
const currentMonthLabel = `${currentMonth}월 총 소비`;

const currentMonthExpenses = computed(() => {
  return expenses.value.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
});

const totalMonthExpenses = computed(() =>
  currentMonthExpenses.value.reduce((sum, e) => sum + e.amount, 0),
);

// 카테고리별 지출 데이터
const categoryData = computed(() => {
  const totals = {};
  for (const e of currentMonthExpenses.value) {
    const name = e.category?.name ?? '기타';
    totals[name] = (totals[name] ?? 0) + e.amount;
  }
  const total = totalMonthExpenses.value;
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  // 각 항목의 정확한 비율과 내림값 계산
  const items = sorted.map(([name, amount], i) => {
    const cat = expenseCategories.value.find((c) => c.name === name);
    const exact = total > 0 ? (amount / total) * 100 : 0;
    return {
      category: name,
      emoji: cat?.icon ?? '💸',
      amount,
      percent: Math.floor(exact),
      remainder: exact - Math.floor(exact),
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    };
  });

  // 100%가 되도록 나머지를 큰 순서대로 1씩 분배 (largest remainder method)
  const floorSum = items.reduce((s, item) => s + item.percent, 0);
  const diff = 100 - floorSum;
  items
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, diff)
    .forEach((item) => { item.percent += 1; });

  return items.map(({ remainder: _r, ...rest }) => rest);
});

const topCategory = computed(() => categoryData.value[0] ?? null);

// shadcn ChartContainer config
const donutConfig = {
  percent: { label: '비율' },
  amount: { label: '금액' },
};

const barConfig = {
  amount: { label: '지출', color: '#a78bfa' },
};

// 도넛 차트
const donutValue = (d) => d.percent;
const donutColor = (_, i) => categoryData.value[i]?.color ?? '#a78bfa';
const donutTooltip = componentToString(donutConfig, ChartTooltipContent, {
  labelKey: 'category',
});

// 월별 소비 추이 데이터 (최근 6개월 동적 계산)
const monthlyData = computed(() => {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const amount = expenses.value
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getMonth() + 1 === m && ed.getFullYear() === y;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    result.push({ month: `${m}월`, amount });
  }
  return result;
});

const barX = (_, i) => i;
const barY = [(d) => d.amount];
const barColor = () => '#a78bfa';
const xTickFormat = (i) => monthlyData.value[i]?.month ?? '';
const barTooltip = componentToString(barConfig, ChartTooltipContent, {
  labelFormatter: (x) => monthlyData.value[Math.round(x)]?.month ?? '',
});

// 멤버별 지출 데이터 (그룹 모드에서만 사용)
const memberExpenseData = computed(() => {
  if (!currentGroup.value) return [];

  // 그룹 멤버 + 지출 기록에 등장하는 유저를 모두 합산 (누락 방지)
  const memberMap = new Map();
  for (const m of currentGroup.value.members ?? []) {
    memberMap.set(m.id, { id: m.id, nickname: m.nickname });
  }
  for (const e of currentMonthExpenses.value) {
    if (!memberMap.has(e.userId)) {
      memberMap.set(e.userId, {
        id: e.userId,
        nickname: e.user?.nickname ?? `유저${e.userId}`,
      });
    }
  }

  const myId = currentUser.value?.id;
  const members = [...memberMap.values()].sort((a, b) => {
    if (a.id === myId) return -1;
    if (b.id === myId) return 1;
    return a.nickname.localeCompare(b.nickname, 'ko', { numeric: true });
  });
  const groupTotal = totalMonthExpenses.value;
  const mapped = members.map((member, i) => {
    const memberExpenses = currentMonthExpenses.value.filter(
      (e) => e.userId === member.id,
    );
    const total = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
    const exact = groupTotal > 0 ? (total / groupTotal) * 100 : 0;
    const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    const isMe = currentUser.value?.id === member.id;
    return {
      id: member.id,
      nickname: member.nickname,
      total,
      groupPercent: Math.floor(exact),
      remainder: exact - Math.floor(exact),
      color,
      isMe,
    };
  });

  // largest remainder method로 합계 100% 보정
  const floorSum = mapped.reduce((s, m) => s + m.groupPercent, 0);
  const diff = 100 - floorSum;
  mapped
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, diff)
    .forEach((m) => { m.groupPercent += 1; });

  const maxTotal = Math.max(...mapped.map((m) => m.total), 1);
  return mapped.map(({ remainder: _r, ...m }) => ({
    ...m,
    barPercent: Math.round((m.total / maxTotal) * 100),
  }));
});
</script>

<template>
  <!-- 헤더 -->
  <div class="px-5 pb-2">
    <h2 class="text-2xl font-bold text-gray-800">소비 분석</h2>
  </div>

  <!-- 총 소비 카드 -->
  <div
    class="mx-5 mt-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-5 shadow-lg relative overflow-hidden"
  >
    <div
      class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-400/30"
    ></div>
    <div
      class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-purple-400/20"
    ></div>
    <p class="text-purple-200 text-sm">{{ currentMonthLabel }}</p>
    <h1 class="text-white text-4xl font-bold mt-1">
      {{ totalMonthExpenses.toLocaleString()
      }}<span class="text-2xl font-semibold">원</span>
    </h1>
    <p class="text-purple-200 text-xs mt-2">
      <template v-if="topCategory">
        {{ topCategory.emoji }} {{ topCategory.category }}에 가장 많이 썼어요
        ({{ topCategory.percent }}%)
      </template>
      <template v-else>이번 달 지출 내역이 없어요</template>
    </p>
  </div>

  <!-- 카테고리별 지출 -->
  <div class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
    <h3 class="text-base font-bold text-gray-800 mb-3">카테고리별 지출</h3>
    <div
      v-if="categoryData.length === 0"
      class="text-center py-6 text-gray-400 text-sm"
    >
      이번 달 지출 내역이 없어요
    </div>
    <div v-else class="flex items-center gap-4">
      <!-- 도넛 차트 -->
      <ChartContainer :config="donutConfig" class="w-36 h-36 flex-shrink-0">
        <VisSingleContainer :data="categoryData" :height="144">
          <VisDonut :value="donutValue" :color="donutColor" :arc-width="32" />
          <ChartTooltip :template="donutTooltip" />
        </VisSingleContainer>
      </ChartContainer>
      <!-- 범례 -->
      <div class="flex flex-col gap-2 flex-1">
        <div
          v-for="item in categoryData"
          :key="item.category"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="text-xs text-gray-600"
              >{{ item.emoji }} {{ item.category }}</span
            >
          </div>
          <span class="text-xs font-semibold" :style="{ color: item.color }"
            >{{ item.percent }}%</span
          >
        </div>
      </div>
    </div>
  </div>

  <!-- 월별 소비 추이 -->
  <div class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
    <h3 class="text-base font-bold text-gray-800 mb-3">월별 소비 추이</h3>
    <ChartContainer :config="barConfig" class="h-36">
      <VisXYContainer :data="monthlyData" :height="144">
        <VisGroupedBar
          :x="barX"
          :y="barY"
          :color="barColor"
          :bar-padding="0.4"
          :rounded-corners="4"
        />
        <VisAxis
          type="x"
          :tick-format="xTickFormat"
          :num-ticks="6"
          :grid-line="false"
          :domain-line="false"
          :tick-padding="10"
        />
        <ChartCrosshair :template="barTooltip" />
      </VisXYContainer>
    </ChartContainer>
  </div>

  <!-- 이번 달 TOP 지출 -->
  <div class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
    <h3 class="text-base font-bold text-gray-800 mb-3">이번 달 TOP 지출</h3>
    <div
      v-if="categoryData.length === 0"
      class="text-center py-6 text-gray-400 text-sm"
    >
      이번 달 지출 내역이 없어요
    </div>
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(item, index) in categoryData.slice(0, 4)"
        :key="item.category"
      >
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400 w-3">{{ index + 1 }}</span>
          <span class="text-lg w-6 text-center">{{ item.emoji }}</span>
          <span class="text-sm text-gray-700 flex-1">{{ item.category }}</span>
          <span class="text-sm font-semibold text-gray-700"
            >{{ item.amount.toLocaleString() }}원</span
          >
          <span
            class="text-xs font-bold w-8 text-right"
            :style="{ color: item.color }"
            >{{ item.percent }}%</span
          >
        </div>
        <div class="ml-10 mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :style="{
              width: item.percent + '%',
              backgroundColor: item.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 멤버별 지출 (그룹 모드) -->
  <div v-if="currentGroup" class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
    <!-- 헤더 -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-base font-bold text-gray-800">멤버별 지출</h3>
        <p class="text-xs text-gray-400 mt-0.5">
          그룹 총 {{ totalMonthExpenses.toLocaleString() }}원
        </p>
      </div>
      <span
        class="text-xs font-medium bg-purple-100 text-purple-500 px-3 py-1 rounded-full"
      >
        이번 달
      </span>
    </div>

    <!-- 빈 상태 -->
    <div
      v-if="memberExpenseData.every((m) => m.total === 0)"
      class="text-center py-6 text-gray-400 text-sm"
    >
      이번 달 지출 내역이 없어요
    </div>

    <!-- 멤버 목록 -->
    <div v-else class="flex flex-col gap-4 max-h-80 overflow-y-auto">
      <div
        v-for="member in memberExpenseData"
        :key="member.id"
        class="flex items-start gap-3"
      >
        <!-- 아바타 -->
        <div
          class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
          :style="{ backgroundColor: member.color }"
        >
          {{ member.nickname.charAt(0) }}
        </div>
        <!-- 내용 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-medium text-gray-800">{{
                member.nickname
              }}</span>
              <span
                v-if="member.isMe"
                class="text-xs bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full font-medium leading-none"
                >나</span
              >
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-xs text-gray-400"
                >{{ member.groupPercent }}%</span
              >
              <span class="text-sm font-bold text-gray-800"
                >{{ member.total.toLocaleString() }}원</span
              >
            </div>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :style="{
                width: member.barPercent + '%',
                backgroundColor: member.color,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 평균 -->
    <div
      class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"
    >
      <span class="text-sm text-gray-400">1인 평균 지출</span>
      <span class="text-sm font-bold text-purple-500">
        {{
          memberExpenseData.length > 0
            ? Math.round(
                totalMonthExpenses / memberExpenseData.length,
              ).toLocaleString()
            : 0
        }}원
      </span>
    </div>
  </div>
</template>
