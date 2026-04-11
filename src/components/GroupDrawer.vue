<script setup>
import { useGroupStore } from '@/stores/group.js';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Search } from 'lucide-vue-next';

const groupStore = useGroupStore();
const { myGroups, currentGroup } = storeToRefs(groupStore);

const isModalOpen = ref(false);

const searchQuery = ref('');
const filteredGroups = computed(() =>
  myGroups.value.filter((g) => g.name.includes(searchQuery.value)),
);

function selectMode(groupId) {
  groupStore.changeCurrentGroup(groupId);
  isModalOpen.value = false;
  searchQuery.value = '';
}

const selectedLabel = computed(() =>
  currentGroup.value ? currentGroup.value.name : '개인',
);
</script>

<template>
  <button
    @click="isModalOpen = true"
    class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
  >
    <span class="truncate max-w-[100px]">{{ selectedLabel }}</span>
    <svg
      class="w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      ></path>
    </svg>
  </button>
  <Teleport to="body">
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-end">
      <!-- 딤 배경 -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="isModalOpen = false"
      ></div>

      <!-- 시트 -->
      <div
        class="relative w-full bg-white rounded-t-3xl px-5 pt-4 pb-10 max-h-[70vh] flex flex-col"
      >
        <!-- 핸들 -->
        <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <p class="text-center font-bold text-gray-800 text-base mb-4">모임</p>

        <!-- 검색 -->
        <div
          class="flex items-center bg-gray-100 rounded-xl px-3 py-2 mb-4 gap-2"
        >
          <span class="text-gray-400 text-sm"><Search class="w-4 h-4" /></span>
          <input
            v-model="searchQuery"
            placeholder="모임명으로 검색..."
            class="bg-transparent text-sm flex-1 outline-none text-gray-700"
          />
        </div>

        <div class="overflow-y-auto flex-1">
          <!-- 개인 -->
          <p class="text-xs text-gray-400 font-semibold mb-1">개인</p>
          <button
            @click="selectMode(null)"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-3 cursor-pointer hover:bg-gray-50"
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

          <!-- 모임 -->
          <p class="text-xs text-gray-400 font-semibold mb-1">모임</p>
          <button
            v-for="group in filteredGroups"
            :key="group.id"
            @click="selectMode(group.id)"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50"
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
</template>

<style scoped></style>
