<script setup>
import {useRecordStore} from '@/stores/record';
import {ref, computed} from 'vue';
import {Pencil, Trash2} from 'lucide-vue-next';
import {useModalStore} from "@/stores/modal.js";
import EditRecordModal from "@/components/EditRecordModal.vue";
import {useUserStore} from "@/stores/user.js";
import {Search} from "lucide-vue-next";


const userStore = useUserStore();
const {user} = userStore;
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
      date: record.date,
      title: record.title,
      category: record.category.name,
      icon: record.category.icon,
      amount: (record.type === 'income' ? 1 : -1) * record.amount,
      isOwner: (record.userId === user.id)
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
  modalStore.openModal(EditRecordModal, {recordId: recordId})
}

async function deleteRecord(recordId) {
  await recordStore.deleteRecord(recordId);
}
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
            i === 0
              ? 'text-red-400'
              : i === 6
                ? 'text-blue-400'
                : 'text-gray-400'
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
              {{
              getDayExpense(day) < 0 ? formatShort(getDayExpense(day)) : ''
            }}
            </span>
          <span class="text-[9px] text-blue-400 leading-tight h-3 block">
              {{
              getDayIncome(day) > 0
                  ? '+' + formatShort(getDayIncome(day))
                  : ''
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
      <span class="text-gray-400 text-sm"><Search class="w-4 h-4"/></span>
      <input
          v-model="searchQuery"
          type="text"
          placeholder="내역 검색..."
          class="flex-1 text-sm text-gray-700 focus:outline-none"
      />
    </div>
  </div>

  <!-- 날짜 필터 표시 -->
  <div
      v-if="selectedDate"
      class="mx-4 mb-2 flex items-center justify-between"
  >
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
    <div v-for="group in groupedTransactions" :key="group.date">
      <!-- 날짜 헤더 -->
      <div class="flex justify-between items-center mb-2 px-1">
          <span class="text-sm font-medium text-gray-700">{{
              group.label
            }}</span>
        <span
            class="text-sm font-medium"
            :class="group.total < 0 ? 'text-red-500' : 'text-blue-500'"
        >
            {{ formatAmount(group.total) }}
          </span>
      </div>

      <!-- 항목들 -->
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div
            v-for="(item, i) in group.items"
            :key="item.id"
            class="flex items-center px-4 py-3"
            :class="i < group.items.length - 1 ? 'border-b border-gray-50' : ''"
        >
          <div
              class="w-10 h-10 bg-[#f3eeff] rounded-xl flex items-center justify-center text-xl mr-3 shrink-0"
          >
            {{ item.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">
              {{ item.title }}
            </p>
            <p class="text-xs text-[#7c4dff] mt-0.5">{{ item.category }}</p>
          </div>
          <span
              class="text-sm font-semibold mr-3"
              :class="item.amount < 0 ? 'text-red-400' : 'text-blue-500'"
          >
              {{ formatAmount(item.amount) }}
            </span>
          <div v-if="item.isOwner">
            <div class="flex items-center gap-2 shrink-0">
              <button
                  @click="openEditModal(item.id)"
                  class="text-gray-300 hover:text-[#7c4dff]"
              >
                <Pencil class="w-4 h-4"/>
              </button>
              <button
                  @click="deleteRecord(item.id)"
                  class="text-gray-300 hover:text-red-400"
              >
                <Trash2 class="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p
        v-if="groupedTransactions.length === 0"
        class="text-center text-sm text-gray-400 py-8"
    >
      내역이 없습니다.
    </p>
  </div>
</template>
