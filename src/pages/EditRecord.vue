<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const amount = ref(Number(route.query.amount) || 1500);
const selectedCategory = ref(route.query.category || '교통');
const date = ref(route.query.date || '2026-04-06');
const memo = ref(route.query.title || '지하철');

const categories = [
  { name: '식비', emoji: '🍔' },
  { name: '교통', emoji: '🚌' },
  { name: '쇼핑', emoji: '🛍️' },
  { name: '카페', emoji: '☕' },
  { name: '취미', emoji: '🎮' },
  { name: '의료', emoji: '💊' },
  { name: '교육', emoji: '📚' },
  { name: '주거', emoji: '🏠' },
  { name: '기타', emoji: '💰' },
];

const formattedAmount = computed(() => Number(amount.value).toLocaleString());

function handleSubmit() {
  router.push('/monthly');
}
</script>

<template>
  <div class="min-h-screen bg-[#f0f0f8] flex flex-col">
    <!-- 보라 헤더 -->
    <div class="bg-[#7c4dff] text-white px-5 pt-12 pb-16">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="mr-3 p-1">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">내역 수정</h1>
      </div>
      <div class="text-center">
        <p class="text-sm opacity-75 mb-1">얼마 썼나요?</p>
        <p class="text-5xl font-bold">
          {{ route.query.type === 'income' ? '+' : '-' }}{{ formattedAmount
          }}<span class="text-3xl font-semibold">원</span>
        </p>
      </div>
    </div>

    <!-- 폼 카드 -->
    <div
      class="bg-white rounded-t-3xl -mt-6 flex-1 px-5 pt-6 pb-28 overflow-y-auto"
    >
      <!-- 금액 -->
      <div class="mb-5">
        <label class="text-sm text-gray-500 mb-1.5 block">금액</label>
        <input
          v-model="amount"
          type="number"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:border-[#7c4dff]"
        />
      </div>

      <!-- 카테고리 -->
      <div class="mb-5">
        <label class="text-sm text-gray-500 mb-2 block">카테고리</label>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="cat in categories"
            :key="cat.name"
            @click="selectedCategory = cat.name"
            class="flex flex-col items-center py-2.5 rounded-xl border-2 transition-all"
            :class="
              selectedCategory === cat.name
                ? 'border-[#7c4dff] bg-[#f3eeff]'
                : 'border-transparent bg-gray-50'
            "
          >
            <span class="text-2xl">{{ cat.emoji }}</span>
            <span class="text-xs mt-1 text-gray-600">{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- 날짜 -->
      <div class="mb-5">
        <label class="text-sm text-gray-500 mb-1.5 block">날짜</label>
        <input
          v-model="date"
          type="date"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:border-[#7c4dff]"
        />
      </div>

      <!-- 메모 -->
      <div class="mb-7">
        <label class="text-sm text-gray-500 mb-1.5 block">메모 (선택)</label>
        <input
          v-model="memo"
          type="text"
          placeholder="메모를 입력하세요"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:border-[#7c4dff]"
        />
      </div>

      <!-- 수정 완료 버튼 -->
      <button
        @click="handleSubmit"
        class="w-full bg-[#7c4dff] text-white py-4 rounded-2xl font-semibold text-base active:opacity-80"
      >
        수정 완료
      </button>
    </div>
  </div>
</template>
