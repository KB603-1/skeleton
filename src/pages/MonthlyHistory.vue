<script setup>
import { useRecordStore } from '@/stores/record';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useModalStore } from '@/stores/modal.js';
import EditRecordModal from '@/components/EditRecordModal.vue';
import RecordDetailModal from '@/components/RecordDetailModal.vue';
import { useUserStore } from '@/stores/user.js';
import { Search } from 'lucide-vue-next';
import TransactionItem from '@/components/TransactionItem.vue';

const userStore = useUserStore();
const { user } = userStore;
const recordStore = useRecordStore();
const currentYear = ref(2026);
const currentMonth = ref(4);
const selectedDate = ref(null);
const searchQuery = ref('');

// 목업 데이터
const transactions = computed(() => {
  return recordStore.records.map((record) => {
    return {
      id: record.id,
      date: record.date?.slice(0, 10),
      title: record.title,
      category: record.category.name,
      icon: record.category.icon,
      amount: (record.type === 'income' ? 1 : -1) * record.amount,
      isOwner: record.userId === user.id,
      payerName: user?.nickname || '나',
      memo: record.memo,
    };
  });
});

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else currentMonth.value--;
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else currentMonth.value++;
}

const calendarDays = computed(() => {
  const firstDay = new Date(
    currentYear.value,
    currentMonth.value - 1,
    1,
  ).getDay();
  const daysInMonth = new Date(
    currentYear.value,
    currentMonth.value,
    0,
  ).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  // 6줄 고정
  while (days.length % 7 !== 0) days.push(null);
  return days;
});

function getDateKey(day) {
  if (!day) return null;
  return `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const transactionsByDate = computed(() => {
  const map = {};
  transactions.value.forEach((t) => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  });
  return map;
});

function getDayExpense(day) {
  const key = getDateKey(day);
  if (!key || !transactionsByDate.value[key]) return 0;
  return transactionsByDate.value[key]
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + t.amount, 0);
}

function getDayIncome(day) {
  const key = getDateKey(day);
  if (!key || !transactionsByDate.value[key]) return 0;
  return transactionsByDate.value[key]
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
}

function formatShort(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000) return `${parseFloat((abs / 10000).toFixed(1))}만`;
  return `${abs.toLocaleString()}`;
}

const monthPrefix = computed(
  () => `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`,
);

const monthlyExpense = computed(() =>
  transactions.value
    .filter((t) => t.date.startsWith(monthPrefix.value) && t.amount < 0)
    .reduce((s, t) => s + t.amount, 0),
);
const monthlyIncome = computed(() =>
  transactions.value
    .filter((t) => t.date.startsWith(monthPrefix.value) && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0),
);

const groupedTransactions = computed(() => {
  const q = searchQuery.value.trim();
  const filtered = transactions.value.filter((t) => {
    if (!t.date.startsWith(monthPrefix.value)) return false;
    if (selectedDate.value && t.date !== selectedDate.value) return false;
    if (q && !t.title.includes(q) && !t.category.includes(q)) return false;
    return true;
  });
  const groups = {};
  filtered.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items,
      total: items.reduce((s, t) => s + t.amount, 0),
      label: formatDateLabel(date),
    }));
});

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
}

function formatAmount(amount) {
  if (amount > 0) return `+${amount.toLocaleString()}원`;
  return `${amount.toLocaleString()}원`;
}

function selectDate(day) {
  if (!day) return;
  const key = getDateKey(day);
  selectedDate.value = selectedDate.value === key ? null : key;
}

function isSelected(day) {
  return selectedDate.value === getDateKey(day);
}

function isSunday(idx) {
  return idx % 7 === 0;
}

function isSaturday(idx) {
  return idx % 7 === 6;
}

const modalStore = useModalStore();

function openEditModal(recordId) {
  modalStore.openModal(EditRecordModal, { recordId: recordId });
}

function openDetailModal(item) {
  modalStore.openModal(RecordDetailModal, { record: item });
}

async function deleteRecord(recordId) {
  await recordStore.deleteRecord(recordId);
}

// ── 15개 제한 + 더보기 ──
const PAGE_SIZE = 15;
const visibleCount = ref(PAGE_SIZE);

// 필터/월 변경 시 리셋
watch([searchQuery, selectedDate, currentYear, currentMonth], () => {
  visibleCount.value = PAGE_SIZE;
});

const allFlatItems = computed(() =>
  groupedTransactions.value.flatMap((g) => g.items),
);
const totalItemCount = computed(() => allFlatItems.value.length);
const hasMore = computed(() => totalItemCount.value > visibleCount.value);

const visibleGroupedTransactions = computed(() => {
  const limited = allFlatItems.value.slice(0, visibleCount.value);
  const groups = {};
  limited.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items,
      total: items.reduce((s, t) => s + t.amount, 0),
      label: formatDateLabel(date),
    }));
});

function loadMore() {
  visibleCount.value += PAGE_SIZE;
}

// ── 상단 이동 버튼 ──
const showScrollTop = ref(false);
let scrollEl = null;

function onScroll() {
  showScrollTop.value = scrollEl.scrollTop > 300;
}

function scrollToTop() {
  scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  scrollEl = document.querySelector('main');
  scrollEl?.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  scrollEl?.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <!-- 타이틀 -->
  <div class="px-5 pb-4 bg-[#f0f0f8]">
    <h1 class="text-3xl font-bold text-gray-900">월간 내역</h1>
  </div>

  <!-- 캘린더 카드 -->
  <div class="mx-4 bg-white rounded-2xl p-4 shadow-sm mb-4">
    <!-- 월 네비게이션 -->
    <div class="flex items-center justify-between mb-1">
      <button @click="prevMonth" class="p-1.5 text-gray-500">
        <svg
          class="w-5 h-5"
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
      <div class="text-center">
        <p class="font-semibold text-gray-800">
          {{ currentYear }}년 {{ currentMonth }}월
        </p>
        <p class="text-xs mt-0.5">
          <span class="text-red-500"
            >지출 {{ Math.abs(monthlyExpense).toLocaleString() }}원</span
          >
          <span class="text-blue-500 ml-2"
            >수입 +{{ monthlyIncome.toLocaleString() }}원</span
          >
        </p>
      </div>
      <button @click="nextMonth" class="p-1.5 text-gray-500">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="(d, i) in dayNames"
        :key="d"
        class="text-center text-xs py-1 font-medium"
        :class="
          i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
        "
      >
        {{ d }}
      </div>
    </div>

    <!-- 날짜 그리드 -->
    <div class="grid grid-cols-7">
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="flex flex-col items-center py-0.5 cursor-pointer"
        @click="selectDate(day)"
      >
        <template v-if="day">
          <div
            class="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-0.5"
            :class="[
              isSelected(day) ? 'bg-[#7c4dff] text-white' : '',
              !isSelected(day) && isSunday(idx) ? 'text-red-400' : '',
              !isSelected(day) && isSaturday(idx) ? 'text-blue-400' : '',
              !isSelected(day) && !isSunday(idx) && !isSaturday(idx)
                ? 'text-gray-700'
                : '',
            ]"
          >
            {{ day }}
          </div>
          <span class="text-[9px] text-red-400 leading-tight h-3 block">
            {{ getDayExpense(day) < 0 ? formatShort(getDayExpense(day)) : '' }}
          </span>
          <span class="text-[9px] text-blue-400 leading-tight h-3 block">
            {{
              getDayIncome(day) > 0 ? '+' + formatShort(getDayIncome(day)) : ''
            }}
          </span>
        </template>
      </div>
    </div>

    <!-- 범례 -->
    <div
      class="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-gray-100"
    >
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
        <span class="text-xs text-gray-500">지출</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
        <span class="text-xs text-gray-500">수입</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-[#7c4dff] inline-block"></span>
        <span class="text-xs text-gray-500">선택</span>
      </div>
    </div>
  </div>

  <!-- 검색 -->
  <div class="mx-4 mb-4">
    <div
      class="bg-white rounded-xl flex items-center px-4 py-3 gap-2 shadow-sm"
    >
      <span class="text-gray-400 text-sm"><Search class="w-4 h-4" /></span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="내역 검색..."
        class="flex-1 text-sm text-gray-700 focus:outline-none"
      />
    </div>
  </div>

  <!-- 날짜 필터 표시 -->
  <div v-if="selectedDate" class="mx-4 mb-2 flex items-center justify-between">
    <span class="text-sm font-medium text-[#7c4dff]">
      {{ formatDateLabel(selectedDate) }} 내역
    </span>
    <button
      @click="selectedDate = null"
      class="text-xs text-gray-400 hover:text-gray-600 underline"
    >
      전체 보기
    </button>
  </div>

  <!-- 내역 목록 -->
  <div class="mx-4 flex flex-col gap-4">
    <div v-for="group in visibleGroupedTransactions" :key="group.date">
      <!-- 날짜 헤더 -->
      <div class="flex justify-between items-center mb-2 px-1">
        <span class="text-sm font-medium text-gray-700">{{ group.label }}</span>
        <span
          class="text-sm font-medium"
          :class="group.total < 0 ? 'text-red-500' : 'text-blue-500'"
        >
          {{ formatAmount(group.total) }}
        </span>
      </div>

      <!-- 항목들 -->
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
        <TransactionItem
          v-for="(item, i) in group.items"
          :key="item.id"
          :item="item"
          variant="list"
          :showBorder="i < group.items.length - 1"
          @edit="openEditModal"
          @delete="deleteRecord"
          @detail="openDetailModal"
        />
      </div>
    </div>

    <!-- 더보기 버튼 -->
    <button
      v-if="hasMore"
      @click="loadMore"
      class="w-full py-3 rounded-2xl bg-white text-[#7c4dff] text-sm font-semibold shadow-sm border border-[#ede9ff] hover:bg-[#f3eeff] transition"
    >
      + 더보기 ({{ totalItemCount - visibleCount }}개 남음)
    </button>

    <p
      v-if="groupedTransactions.length === 0"
      class="text-center text-sm text-gray-400 py-8"
    >
      내역이 없습니다.
    </p>
  </div>

  <!-- 상단으로 이동 버튼 -->
  <transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <button
      v-if="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-36 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#7c4dff] hover:border-[#7c4dff] transition z-40"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  </transition>
</template>
