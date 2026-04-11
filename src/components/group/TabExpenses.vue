<script setup>
import { computed, ref } from 'vue';
import TransactionItem from '@/components/TransactionItem.vue';
import { useModalStore } from '@/stores/modal.js';
import MakeRecordModal from '@/components/MakeRecordModal.vue';
import RecordDetailModal from '@/components/RecordDetailModal.vue';

const props = defineProps({
  expenses: { type: Array, required: true },
});

const emit = defineEmits(['deleteExpense', 'editExpense']);

const modalStore = useModalStore();
const activeType = ref('all'); // 'all' (전체), 'expense' (지출) 또는 'income' (수입)

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function openDetailModal(item) {
  modalStore.openModal(RecordDetailModal, { record: item });
}

function openAddModal() {
  modalStore.openModal(MakeRecordModal);
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
}

// 날짜별로 지출 내역을 그룹화합니다.
const groupedExpenses = computed(() => {
  const groups = {};
  const filtered =
    activeType.value === 'all'
      ? props.expenses
      : props.expenses.filter((t) => t.type === activeType.value);

  filtered.forEach((t) => {
    // 데이터에 시간(14:30:00)이 포함되어 있을 경우를 대비해 'YYYY-MM-DD' 형태의 앞 10자리만 추출하여 그룹화합니다.
    const dateKey = t.date ? t.date.substring(0, 10) : 'unknown';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(t);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a)) // 최신 날짜가 위로 오도록 정렬
    .map(([date, items]) => ({
      date,
      items,
      total: items.reduce((s, t) => s + t.amount, 0),
      label: formatDateLabel(date),
    }));
});

function formatAmount(amount) {
  if (amount > 0) return `+${amount.toLocaleString()}원`;
  return `${amount.toLocaleString()}원`;
}
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <!-- 수입/지출 토글 -->
    <div class="flex p-1 bg-slate-100 rounded-xl mb-4">
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

    <button
      @click="openAddModal"
      class="w-full border-2 border-dashed border-violet-300 text-violet-600 rounded-2xl py-4 font-medium mb-6 hover:bg-violet-50 transition flex items-center justify-center gap-2"
    >
      <span>+</span> 내역 추가
    </button>

    <div
      v-if="groupedExpenses.length === 0"
      class="text-center text-slate-400 py-10"
    >
      이번 달
      {{
        activeType === 'all'
          ? ''
          : activeType === 'expense'
            ? '지출 '
            : '수입 '
      }}내역이 없습니다.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="group in groupedExpenses" :key="group.date">
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

        <!-- 묶인 항목들 (variant="list" 사용) -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
          <TransactionItem
            v-for="(item, i) in group.items"
            :key="item.id"
            :item="item"
            variant="list"
            :showBorder="i < group.items.length - 1"
            @edit="emit('editExpense', $event)"
            @delete="emit('deleteExpense', $event)"
            @detail="openDetailModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
