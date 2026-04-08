<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="min-h-screen bg-[#f2f0fb] flex flex-col pb-24">
    <!-- 상단 헤더 -->
    <div class="flex items-center justify-between px-5 pt-6 pb-2">
      <div>
        <p class="text-xs text-gray-400">4월 7일 화요일</p>
        <h2 class="text-2xl font-bold text-gray-800 mt-0.5">안녕하세요! 👋</h2>
      </div>
      <div
        class="w-11 h-11 rounded-full bg-purple-500 flex items-center justify-center text-xl shadow-md"
      >
        😊
      </div>
    </div>

    <!-- 총 지출 카드 -->
    <div
      @click="router.push('/stats')"
      class="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-5 shadow-lg relative overflow-hidden cursor-pointer"
    >
      <!-- 배경 장식 원 -->
      <div
        class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-400/30"
      ></div>
      <div
        class="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-purple-400/20"
      ></div>

      <p class="text-purple-200 text-sm">4월 총 지출</p>
      <h1 class="text-white text-4xl font-bold mt-1">
        195,000<span class="text-2xl font-semibold">원</span>
      </h1>
      <div
        class="mt-3 inline-flex items-center gap-1.5 bg-purple-600/50 rounded-full px-3 py-1 text-white text-xs"
      >
        <span class="text-green-300">↘</span>
        지난 달 대비
        <span class="text-green-300 font-semibold">▼ 56% 절약</span>
      </div>
    </div>

    <!-- 동기부여 카드 -->
    <div
      class="mx-5 mt-3 rounded-2xl bg-white px-4 py-3.5 flex items-center gap-3 shadow-sm"
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
    </div>

    <!-- 카테고리 그리드 -->
    <div class="mx-5 mt-3 grid grid-cols-2 gap-3">
      <div
        @click="router.push('/stats')"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <span class="text-2xl">🍔</span>
        <p class="text-xs text-gray-400 mt-2">식비</p>
        <p class="text-base font-bold text-red-400 mt-0.5">58,500원</p>
      </div>
      <div
        @click="router.push('/stats')"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <span class="text-2xl">🛍️</span>
        <p class="text-xs text-gray-400 mt-2">쇼핑</p>
        <p class="text-base font-bold text-purple-500 mt-0.5">53,000원</p>
      </div>
      <div
        @click="router.push('/stats')"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <span class="text-2xl">☕</span>
        <p class="text-xs text-gray-400 mt-2">카페</p>
        <p class="text-base font-bold text-amber-400 mt-0.5">14,000원</p>
      </div>
      <div
        @click="router.push('/stats')"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <span class="text-2xl">🚌</span>
        <p class="text-xs text-gray-400 mt-2">교통</p>
        <p class="text-base font-bold text-blue-400 mt-0.5">4,500원</p>
      </div>
    </div>

    <!-- 최근 내역 -->
    <div class="mx-5 mt-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold text-gray-800">최근 내역</h3>
        <a href="#" class="text-xs text-purple-500 font-medium">전체보기 ›</a>
      </div>

      <div class="flex flex-col gap-2">
        <!-- 거래 항목 -->
        <div
          class="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
        >
          <div
            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl flex-shrink-0"
          >
            🍔
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">점심 - 제육볶음</p>
            <p class="text-xs text-gray-400 mt-0.5">식비 · 04/07</p>
          </div>
          <p class="text-sm font-semibold text-gray-700">-12,000원</p>
        </div>

        <div
          class="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
        >
          <div
            class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl flex-shrink-0"
          >
            ☕
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">아이스 아메리카노</p>
            <p class="text-xs text-gray-400 mt-0.5">카페 · 04/07</p>
          </div>
          <p class="text-sm font-semibold text-gray-700">-4,500원</p>
        </div>

        <div
          class="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0"
          >
            🚌
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">지하철</p>
            <p class="text-xs text-gray-400 mt-0.5">교통 · 04/06</p>
          </div>
          <p class="text-sm font-semibold text-gray-700">-1,500원</p>
        </div>

        <div
          class="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
        >
          <div
            class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl flex-shrink-0"
          >
            🛍️
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">옷 구매</p>
            <p class="text-xs text-gray-400 mt-0.5">쇼핑 · 04/06</p>
          </div>
          <p class="text-sm font-semibold text-gray-700">-35,000원</p>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-3 shadow-lg"
    >
      <button class="flex flex-col items-center gap-1 text-purple-600">
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7m-9 0v10m4-10v10m-4 0h4"
          />
        </svg>
        <span class="text-[10px] font-medium">홈</span>
      </button>

      <button class="flex flex-col items-center gap-1 text-gray-400">
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span class="text-[10px] font-medium">내역</span>
      </button>

      <!-- 중앙 + 버튼 -->
      <button
        class="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center shadow-lg -mt-6"
      >
        <svg
          class="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span class="sr-only">추가</span>
      </button>

      <button class="flex flex-col items-center gap-1 text-gray-400">
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M12 12a4 4 0 100-8 4 4 0 000 8z"
          />
        </svg>
        <span class="text-[10px] font-medium">모임</span>
      </button>

      <button class="flex flex-col items-center gap-1 text-gray-400">
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h10M13 19V9a2 2 0 012-2h2a2 2 0 012 2v10"
          />
        </svg>
        <span class="text-[10px] font-medium">통계</span>
      </button>
    </div>
  </div>
</template>
