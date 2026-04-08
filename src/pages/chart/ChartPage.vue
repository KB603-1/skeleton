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

// 카테고리별 지출 데이터
const categoryData = [
  { category: '식비',  emoji: '🍔', amount: 58500,  percent: 30, color: '#ef4444' },
  { category: '쇼핑',  emoji: '🛍️', amount: 52650,  percent: 27, color: '#a855f7' },
  { category: '교육',  emoji: '📚', amount: 50700,  percent: 26, color: '#60a5fa' },
  { category: '취미',  emoji: '🎮', amount: 15600,  percent: 8,  color: '#22c55e' },
  { category: '카페',  emoji: '☕', amount: 13650,  percent: 7,  color: '#f59e0b' },
  { category: '교통',  emoji: '🚌', amount: 3900,   percent: 2,  color: '#6366f1' },
];

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
const donutColor = (_, i) => categoryData[i].color;
const donutTooltip = componentToString(donutConfig, ChartTooltipContent, {
  labelKey: 'category',
});

// 월별 소비 추이 데이터
const monthlyData = [
  { month: '11월', amount: 0 },
  { month: '12월', amount: 0 },
  { month: '1월',  amount: 0 },
  { month: '2월',  amount: 0 },
  { month: '3월',  amount: 450000 },
  { month: '4월',  amount: 195000 },
];

const barX = (_, i) => i;
const barY = [(d) => d.amount];
const barColor = () => '#a78bfa';
const xTickFormat = (i) => monthlyData[i]?.month ?? '';
const barTooltip = componentToString(barConfig, ChartTooltipContent, {
  labelFormatter: (x) => monthlyData[Math.round(x)]?.month ?? '',
});
</script>

<template>
  <div class="min-h-screen bg-[#f2f0fb] flex flex-col pb-24">

    <!-- 헤더 -->
    <div class="px-5 pt-6 pb-2">
      <h2 class="text-2xl font-bold text-gray-800">소비 분석</h2>
    </div>

    <!-- 총 소비 카드 -->
    <div class="mx-5 mt-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-5 shadow-lg relative overflow-hidden">
      <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-400/30"></div>
      <div class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-purple-400/20"></div>
      <p class="text-purple-200 text-sm">4월 총 소비</p>
      <h1 class="text-white text-4xl font-bold mt-1">
        195,000<span class="text-2xl font-semibold">원</span>
      </h1>
      <p class="text-purple-200 text-xs mt-2">🍔 식비에 가장 많이 썼어요 (30%)</p>
    </div>

    <!-- 카테고리별 지출 -->
    <div class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <h3 class="text-base font-bold text-gray-800 mb-3">카테고리별 지출</h3>
      <div class="flex items-center gap-4">
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
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
              <span class="text-xs text-gray-600">{{ item.emoji }} {{ item.category }}</span>
            </div>
            <span class="text-xs font-semibold" :style="{ color: item.color }">{{ item.percent }}%</span>
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
            :grid-line="false"
            :domain-line="false"
          />
          <ChartCrosshair :template="barTooltip" />
        </VisXYContainer>
      </ChartContainer>
    </div>

    <!-- 이번 달 TOP 지출 -->
    <div class="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <h3 class="text-base font-bold text-gray-800 mb-3">이번 달 TOP 지출</h3>
      <div class="flex flex-col gap-3">
        <div v-for="(item, index) in categoryData.slice(0, 4)" :key="item.category">
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-3">{{ index + 1 }}</span>
            <span class="text-lg w-6 text-center">{{ item.emoji }}</span>
            <span class="text-sm text-gray-700 flex-1">{{ item.category }}</span>
            <span class="text-sm font-semibold text-gray-700">{{ item.amount.toLocaleString() }}원</span>
            <span class="text-xs font-bold w-8 text-right" :style="{ color: item.color }">{{ item.percent }}%</span>
          </div>
          <div class="ml-10 mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: item.percent + '%', backgroundColor: item.color }"
            ></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
