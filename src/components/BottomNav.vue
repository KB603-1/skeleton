<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-2 z-50">
    <!-- 홈 -->
    <button
      @click="router.push('/')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/') ? 'text-violet-600' : 'text-gray-400'"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span class="text-xs font-medium">홈</span>
    </button>

    <!-- 내역 -->
    <button
      @click="router.push('/history')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/history') ? 'text-violet-600' : 'text-gray-400'"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
      <span class="text-xs font-medium">내역</span>
    </button>

    <!-- 추가 버튼 (가운데) -->
    <button
      @click="router.push('/add')"
      class="flex flex-col items-center justify-center w-14 h-14 -mt-6 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-300"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- 모임 -->
    <button
      @click="router.push('/group')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/group') ? 'text-violet-600' : 'text-gray-400'"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <span class="text-xs font-medium">모임</span>
    </button>

    <!-- 통계 -->
    <button
      @click="router.push('/stats')"
      class="flex flex-col items-center gap-1 py-1 px-3"
      :class="isActive('/stats') ? 'text-violet-600' : 'text-gray-400'"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span class="text-xs font-medium">통계</span>
    </button>
  </nav>
</template>
