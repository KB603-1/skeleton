<script setup>
const props = defineProps({
  groupName: String,
  currentYear: Number,
  currentMonth: Number,
  totalInfo: Object,
  members: Array,
  activeTab: String, // 'expenses' | 'members' | 'play'
});

const emit = defineEmits(['close', 'changeMonth', 'update:activeTab']);
</script>

<template>
  <header class="bg-violet-600 pt-12 text-white relative overflow-hidden">
    <div
      class="absolute top-[-50px] right-[-50px] w-40 h-40 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
    ></div>
    <div
      class="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50"
    ></div>

    <div class="px-5 mb-4 flex items-center justify-between relative z-10">
      <div class="flex items-center gap-3">
        <button
          @click="emit('close')"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition backdrop-blur-sm"
        >
          ✕
        </button>
        <h1 class="text-xl font-bold flex items-center gap-2">
          🏠 {{ groupName }}
        </h1>
      </div>
      <div class="flex -space-x-2">
        <div
          v-for="member in members"
          :key="member.id"
          class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm border-2 border-violet-600 shadow-sm z-10"
        >
          {{ member.icon }}
        </div>
      </div>
    </div>

    <div class="px-5 mb-5 flex items-center justify-center gap-4 relative z-10">
      <button
        @click="emit('changeMonth', -1)"
        class="text-violet-200 hover:text-white p-2 transition"
      >
        ◀
      </button>
      <span class="text-lg font-bold tracking-wide w-32 text-center"
        >{{ currentYear }}년 {{ currentMonth }}월</span
      >
      <button
        @click="emit('changeMonth', 1)"
        class="text-violet-200 hover:text-white p-2 transition"
      >
        ▶
      </button>
    </div>

    <div class="px-5 mb-8 relative z-10">
      <div
        class="bg-white/10 rounded-3xl p-5 border border-white/20 backdrop-blur-md shadow-lg shadow-violet-900/20"
      >
        <div class="flex justify-between items-end mb-4">
          <div>
            <p class="text-sm text-violet-200 mb-1 font-medium">
              우리 모임 총 지출
            </p>
            <div class="flex items-baseline gap-1">
              <p class="text-3xl font-extrabold tracking-tight">
                {{ totalInfo.totalAmount.toLocaleString() }}
              </p>
              <span class="text-lg font-medium text-violet-200">원</span>
            </div>
          </div>
          <div
            class="bg-white/20 px-3 py-1.5 rounded-xl flex flex-col items-end"
          >
            <span class="text-[10px] text-violet-100 font-medium"
              >1인 평균</span
            >
            <span class="text-sm font-bold"
              >{{ totalInfo.perPersonAmount.toLocaleString() }}원</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="relative px-5 z-10">
      <div class="flex relative">
        <button
          @click="emit('update:activeTab', 'expenses')"
          class="flex-1 pb-4 text-center text-sm font-bold transition-colors"
          :class="activeTab === 'expenses' ? 'text-white' : 'text-violet-300'"
        >
          수입 / 지출
        </button>
        <button
          @click="emit('update:activeTab', 'members')"
          class="flex-1 pb-4 text-center text-sm font-bold transition-colors"
          :class="activeTab === 'members' ? 'text-white' : 'text-violet-300'"
        >
          멤버 관리
        </button>
        <button
          @click="emit('update:activeTab', 'play')"
          class="flex-1 pb-4 text-center text-sm font-bold transition-colors"
          :class="activeTab === 'play' ? 'text-white' : 'text-violet-300'"
        >
          플레이 🎲
        </button>
      </div>
      <div
        class="absolute bottom-0 left-5 right-5 h-[1px] bg-violet-400/30"
      ></div>
      <div
        class="absolute bottom-0 h-1 bg-white rounded-t-md transition-transform duration-300 ease-out shadow-[0_-2px_10px_rgba(255,255,255,0.3)]"
        style="width: calc((100% - 2.5rem) / 3)"
        :class="{
          'translate-x-0': activeTab === 'expenses',
          'translate-x-[100%]': activeTab === 'members',
          'translate-x-[200%]': activeTab === 'play',
        }"
      ></div>
    </div>
  </header>
</template>
