<script setup>
import { ref, computed } from 'vue';
import { useRecordStore } from '@/stores/record';
import { useUserStore } from '@/stores/user';
import { useModalStore } from '@/stores/modal.js';
import { storeToRefs } from 'pinia';
import TransactionItem from '@/components/TransactionItem.vue';
import RecordDetailModal from '@/components/RecordDetailModal.vue';
import PigIcon from '../PigIcon.vue';

const recordStore = useRecordStore();
const userStore = useUserStore();
const modalStore = useModalStore();

const { records } = storeToRefs(recordStore);
const { user } = storeToRefs(userStore);

const activeType = ref('all'); // 'all', 'expense', 'income'

const today = new Date();

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return '오늘';
  if (d.toDateString() === yesterday.toDateString()) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
}

function formatAmount(amount) {
  if (amount > 0) return `+${amount.toLocaleString()}원`;
  return `${amount.toLocaleString()}원`;
}

const groupedRecentTransactions = computed(() => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const filtered =
    activeType.value === 'all'
      ? records.value
      : records.value.filter((r) => r.type === activeType.value);

  const recentItems = filtered
    .filter((e) => e.date && new Date(e.date) >= oneWeekAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const groups = {};
  recentItems.forEach((e) => {
    const dateKey = e.date.substring(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push({
      id: e.id,
      icon: e.category?.icon || '💸',
      title: e.title,
      category: e.category?.name || '기타',
      amount: (e.type === 'income' ? 1 : -1) * e.amount,
      isOwner: user.value && e.userId === user.value.id,
      payerName: e.user?.nickname,
      date: e.date,
    });
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

function openDetailModal(item) {
  modalStore.openModal(RecordDetailModal, { record: item });
}
</script>

<template>
  <div class="mx-5 mt-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-base font-bold text-gray-800">최근 내역</h3>
      <RouterLink to="/monthly" class="text-xs text-[#606060] font-medium"
        >전체보기 ›</RouterLink
      >
    </div>

    <!-- 수입/지출 토글 -->
    <div class="flex p-1 bg-slate-100 rounded-xl mb-3">
      <button
        @click="activeType = 'all'"
        class="flex-1 py-2.5 text-sm font-medium rounded-lg transition"
        :class="
          activeType === 'all'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        "
      >
        전체
      </button>
      <button
        @click="activeType = 'expense'"
        class="flex-1 py-2.5 text-sm font-medium rounded-lg transition"
        :class="
          activeType === 'expense'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        "
      >
        지출
      </button>
      <button
        @click="activeType = 'income'"
        class="flex-1 py-2.5 text-sm font-medium rounded-lg transition"
        :class="
          activeType === 'income'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        "
      >
        수입
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <!-- 최근 내역이 없을 때 (Empty State) -->
      <div
        v-if="groupedRecentTransactions.length === 0"
        class="flex flex-col items-center justify-center py-10"
      >
        <div class="w-16 h-16 mb-3 opacity-50 grayscale">
          <PigIcon
            eye-color="#94A3B8"
            nose-spot-color="#CBD5E1"
            :show-ear-tag="false"
          />
        </div>
        <p class="text-sm font-bold text-[#191919]">최근 7일간 내역이 없어요</p>
        <p class="text-xs text-gray-400 mt-1">
          새로운 수입/지출을 기록해보세요!
        </p>
      </div>

      <!-- 최근 내역이 있을 때 -->
      <div v-else class="flex flex-col gap-4">
        <div v-for="group in groupedRecentTransactions" :key="group.date">
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

          <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <TransactionItem
              v-for="(tx, i) in group.items"
              :key="tx.id"
              :item="tx"
              variant="list"
              :showBorder="i < group.items.length - 1"
              @detail="openDetailModal"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
