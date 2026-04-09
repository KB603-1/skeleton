<script setup>
import { useRouter } from 'vue-router';
import BottomNav from '@/components/BottomNav.vue';
import Card from '@/components/ui/card/Card.vue';
import RecentTransactions from '@/components/main/RecentTransactions.vue';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from '@/components/ui/carousel';
import { useRecordStore } from '@/stores/record';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const recordStore = useRecordStore();
const { expenses } = storeToRefs(recordStore);

const groupStore = useGroupStore();
const { myGroups, currentGroup } = storeToRefs(groupStore);

const today = new Date();
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const month = today.getMonth() + 1;
const day = today.getDate();
const weekday = WEEKDAYS[today.getDay()];
const todayLabel = `${month}월 ${day}일 ${weekday}요일`;
const currentMonthLabel = `${month}월 총 지출`;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const totalExpenses = computed(() => {
  let sum = 0;
  for (const expense of expenses.value) {
    sum += expense.amount;
  }
  return sum;
});

// 지난달과 비교
const lastMonthResult = computed(() => {
  const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const lastYear =
    today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const sum = expenses.value
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastYear;
    })
    .reduce((acc, e) => acc + e.amount, 0);
  if (sum === 0) return { hasData: false };
  const percent = Math.round(((sum - totalExpenses.value) / sum) * 100);
  return { hasData: true, percent };
});

onMounted(() => {
  recordStore.fetchRecord();
  recordStore.fetchCategories();
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

// 모드 선택 모달
const isModalOpen = ref(false);
const searchQuery = ref('');

const filteredGroups = computed(() =>
  myGroups.value.filter((g) => g.name.includes(searchQuery.value)),
);

const selectedLabel = computed(() =>
  currentGroup.value ? currentGroup.value.name : '개인',
);

function selectMode(groupId) {
  groupStore.changeCurrentGroup(groupId);
  isModalOpen.value = false;
  searchQuery.value = '';
}
</script>

<template>
  <div class="min-h-screen bg-[#f2f0fb] flex flex-col pb-24">
    <!-- 상단 헤더 -->
    <div class="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <p class="text-xs text-gray-400">{{ todayLabel }}</p>
        <h2 class="text-2xl font-bold text-gray-800 mt-0.5">안녕하세요! 👋</h2>
        <p class="text-base text-gray-500">{{ user?.nickname }}님</p>
      </div>

      <!-- 모드 선택 버튼 -->
      <button
        @click="isModalOpen = true"
        class="flex items-center gap-1.5 bg-purple-100 text-purple-700 font-semibold text-sm px-4 py-2 rounded-full"
      >
        {{ selectedLabel }}
        <span class="text-xs">▾</span>
      </button>
    </div>

    <!-- 바텀시트 모달 -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-end">
        <!-- 딤 배경 -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="isModalOpen = false"
        ></div>

        <!-- 시트 -->
        <div
          class="relative w-full bg-white rounded-t-3xl px-5 pt-4 pb-10 max-h-[70vh] flex flex-col"
        >
          <!-- 핸들 -->
          <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p class="text-center font-bold text-gray-800 text-base mb-4">
            모드 설정
          </p>

          <!-- 검색 -->
          <div
            class="flex items-center bg-gray-100 rounded-xl px-3 py-2 mb-4 gap-2"
          >
            <span class="text-gray-400 text-sm">🔍</span>
            <input
              v-model="searchQuery"
              placeholder="그룹명으로 검색..."
              class="bg-transparent text-sm flex-1 outline-none text-gray-700"
            />
          </div>

          <div class="overflow-y-auto flex-1">
            <!-- 개인 -->
            <p class="text-xs text-gray-400 font-semibold mb-1">개인</p>
            <button
              @click="selectMode(null)"
              class="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-3"
              :class="!currentGroup ? 'bg-purple-50' : ''"
            >
              <div
                class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg"
              >
                👤
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-semibold text-gray-800">개인</p>
                <p class="text-xs text-gray-400">나의 개인 가계부</p>
              </div>
              <span v-if="!currentGroup" class="text-purple-500 font-bold"
                >✓</span
              >
            </button>

            <!-- 그룹 -->
            <p class="text-xs text-gray-400 font-semibold mb-1">그룹</p>
            <button
              v-for="group in filteredGroups"
              :key="group.id"
              @click="selectMode(group.id)"
              class="w-full flex items-center gap-3 px-3 py-3 rounded-xl"
              :class="currentGroup?.id === group.id ? 'bg-purple-50' : ''"
            >
              <div
                class="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg"
              >
                🏠
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-semibold text-gray-800">
                  {{ group.name }}
                </p>
              </div>
              <span
                v-if="currentGroup?.id === group.id"
                class="text-purple-500 font-bold"
                >✓</span
              >
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 총 지출 카드 -->
    <div
      @click="router.push('/stats')"
      class="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-5 shadow-lg relative overflow-hidden cursor-pointer"
    >
      <div
        class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-400/30"
      ></div>
      <div
        class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-purple-400/20"
      ></div>
      <p class="text-purple-200 text-sm">{{ currentMonthLabel }}</p>
      <h1 class="text-white text-4xl font-bold mt-1">
        {{ totalExpenses.toLocaleString()
        }}<span class="text-2xl font-semibold">원</span>
      </h1>
      <div
        class="mt-3 inline-flex items-center gap-1.5 bg-purple-600/50 rounded-full px-3 py-1 text-white text-xs"
      >
        <span
          v-if="!lastMonthResult.hasData"
          class="text-green-300 font-semibold"
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
      class="mx-5 mt-3 rounded-2xl border-0 px-4 py-3.5 gap-0 flex-row items-center gap-3 shadow-sm"
    >
      <div
        class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0"
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
    <div v-if="!currentGroup" class="mx-5 mt-3">
      <div
        v-if="spendingType"
        class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col gap-3"
      >
        <span
          class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start"
        >
          ✨ 나의 소비 유형
        </span>
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-2xl bg-purple-400/30 flex items-center justify-center text-4xl flex-shrink-0"
          >
            {{ spendingType.emoji }}
          </div>
          <div>
            <p class="text-white text-xl font-bold">{{ spendingType.label }}</p>
            <p class="text-purple-200 text-sm mt-1">{{ spendingType.desc }}</p>
          </div>
        </div>
        <div class="bg-purple-400/20 rounded-xl px-4 py-3">
          <p class="text-purple-100 text-xs">
            이번 달 가장 많이 쓴 카테고리를 기반으로 분석했어요.
          </p>
        </div>
      </div>
      <div
        v-else
        class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-center"
      >
        <p class="text-purple-200 text-sm">아직 지출 내역이 없어요</p>
        <p class="text-white font-semibold mt-1">기록을 시작해보세요! 📝</p>
      </div>
    </div>

    <!-- 그룹 모드: 캐러셀 (shadcn Carousel + embla) -->
    <Carousel
      v-else
      class="mx-5 mt-3"
      :opts="{ align: 'center', containScroll: false }"
    >
      <CarouselContent class="gap-3">
        <!-- 슬라이드 1: 이달의 지출왕 -->
        <CarouselItem class="basis-[88%]">
          <div
            class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col h-[300px]"
          >
            <span
              class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-4"
            >
              🏆 이달의 지출왕
            </span>
            <div class="flex flex-col flex-1 justify-between">
              <div
                class="flex items-center bg-purple-400/30 rounded-xl px-4 py-3.5"
              >
                <span class="text-2xl mr-3">👑</span>
                <span class="flex-1 text-white font-semibold text-base"
                  >김민준</span
                >
                <span
                  class="bg-purple-700/60 text-white text-sm font-bold px-3 py-1 rounded-lg"
                  >312,000원</span
                >
              </div>
              <div
                class="flex items-center bg-purple-400/30 rounded-xl px-4 py-3.5"
              >
                <span class="text-2xl mr-3">🥈</span>
                <span class="flex-1 text-white font-semibold text-base"
                  >나</span
                >
                <span
                  class="bg-purple-700/60 text-white text-sm font-bold px-3 py-1 rounded-lg"
                  >195,000원</span
                >
              </div>
              <div
                class="flex items-center bg-purple-400/30 rounded-xl px-4 py-3.5"
              >
                <span class="text-2xl mr-3">🥉</span>
                <span class="flex-1 text-white font-semibold text-base"
                  >이수연</span
                >
                <span
                  class="bg-purple-700/60 text-white text-sm font-bold px-3 py-1 rounded-lg"
                  >129,000원</span
                >
              </div>
            </div>
          </div>
        </CarouselItem>

        <!-- 슬라이드 2: 그룹 공동 목표 -->
        <CarouselItem class="basis-[88%]">
          <div
            class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col h-[300px]"
          >
            <span
              class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-3"
            >
              🎯 그룹 공동 목표
            </span>
            <p class="text-purple-200 text-sm">이번 달 그룹 목표</p>
            <p class="text-white text-3xl font-bold mt-1">
              600,000<span class="text-xl font-semibold">원</span>
            </p>
            <p class="text-purple-200 text-xs mt-1">
              현재 482,000원 사용 중 · 남은 예산 118,000원
            </p>
            <div class="mt-3">
              <div class="w-full bg-purple-400/30 rounded-full h-2.5">
                <div
                  class="bg-teal-300 h-2.5 rounded-full"
                  style="width: 80%"
                ></div>
              </div>
              <div class="flex justify-between text-purple-200 text-xs mt-1">
                <span>0원</span>
                <span class="font-semibold text-white">80% 달성</span>
                <span>600,000원</span>
              </div>
            </div>
            <div class="flex gap-2 mt-3 flex-1 items-end">
              <div
                v-for="m in [
                  { name: '나', pct: '40%' },
                  { name: '김민준', pct: '33%' },
                  { name: '이수연', pct: '27%' },
                ]"
                :key="m.name"
                class="flex-1 bg-purple-400/30 rounded-xl py-2.5 flex flex-col items-center"
              >
                <span class="w-2 h-2 rounded-full bg-purple-300 mb-1.5"></span>
                <span class="text-purple-200 text-xs">{{ m.name }}</span>
                <span class="text-white text-sm font-bold mt-0.5">{{
                  m.pct
                }}</span>
              </div>
            </div>
          </div>
        </CarouselItem>

        <!-- 슬라이드 3: 멍청 비용 -->
        <CarouselItem class="basis-[88%]">
          <div
            class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 flex flex-col h-[300px]"
          >
            <span
              class="inline-flex items-center gap-1.5 bg-purple-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-2"
            >
              🐔 멍청 비용
            </span>
            <p class="text-purple-200 text-sm">이번 달 아까운 지출</p>
            <p class="text-white text-3xl font-bold mt-1 mb-3">
              47,500<span class="text-xl font-semibold">원</span>
            </p>
            <div class="flex flex-col flex-1 justify-between">
              <div
                v-for="item in [
                  {
                    emoji: '🛒',
                    label: '충동구매 (옷)',
                    tag: '후회',
                    amount: '35,000원',
                  },
                  {
                    emoji: '🧋',
                    label: '비싼 음료',
                    tag: '과소비',
                    amount: '8,500원',
                  },
                  {
                    emoji: '📦',
                    label: '미사용 구독',
                    tag: '낭비',
                    amount: '4,000원',
                  },
                ]"
                :key="item.label"
                class="flex items-center bg-purple-400/30 rounded-xl px-3 py-2.5"
              >
                <span class="text-lg mr-2.5 flex-shrink-0">{{
                  item.emoji
                }}</span>
                <span
                  class="flex-1 text-white text-sm font-medium min-w-0 truncate mr-2"
                  >{{ item.label }}</span
                >
                <span
                  class="bg-purple-300/30 text-purple-100 text-xs px-2 py-0.5 rounded-full mr-2 flex-shrink-0"
                  >{{ item.tag }}</span
                >
                <span class="text-white text-sm font-bold flex-shrink-0">{{
                  item.amount
                }}</span>
              </div>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>

      <!-- Dot indicator -->
      <CarouselDots class="mt-3" />
    </Carousel>

    <!-- 최근 내역 -->
    <RecentTransactions />

    <BottomNav />
  </div>
</template>
