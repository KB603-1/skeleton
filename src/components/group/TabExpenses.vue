<script setup>
const props = defineProps({
  expenses: { type: Array, required: true },
});

const emit = defineEmits(['deleteExpense']);
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <button
      class="w-full border-2 border-dashed border-violet-300 text-violet-600 rounded-2xl py-4 font-medium mb-6 hover:bg-violet-50 transition flex items-center justify-center gap-2"
    >
      <span>+</span> 지출 추가
    </button>

    <div v-if="expenses.length === 0" class="text-center text-slate-400 py-10">
      이번 달 지출 내역이 없습니다.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="text-3xl bg-slate-50 rounded-xl w-12 h-12 flex items-center justify-center"
          >
            {{ expense.icon }}
          </div>
          <div>
            <p class="font-bold text-slate-900 mb-0.5">{{ expense.title }}</p>
            <p class="text-xs text-slate-500">
              {{ expense.payer }} 결제 · {{ expense.date }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-slate-900"
            >{{ expense.amount.toLocaleString() }}원</span
          >
          <button
            @click="emit('deleteExpense', expense.id)"
            class="text-red-400 hover:text-red-600 p-1"
          >
            🗑️
          </button>
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
