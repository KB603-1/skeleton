<script setup>
import { ref } from 'vue';

const props = defineProps({
  members: { type: Array, required: true },
  isOwner: { type: Boolean, default: false },
  budgetGoal: { type: Number, default: 0 },
});

const emit = defineEmits(['copyLink', 'removeMember', 'setBudget']);

const isEditingBudget = ref(false);
const budgetInput = ref('');

function openBudgetEdit() {
  budgetInput.value = props.budgetGoal > 0 ? String(props.budgetGoal) : '';
  isEditingBudget.value = true;
}

function onBudgetInput(e) {
  const digits = e.target.value.replace(/[^0-9]/g, '');
  budgetInput.value = digits;
  e.target.value = digits ? Number(digits).toLocaleString() : '';
}

function saveBudget() {
  const val = Number(budgetInput.value.replace(/[^0-9]/g, ''));
  if (!val || val <= 0) return;
  emit('setBudget', val);
  isEditingBudget.value = false;
}

function clearBudget() {
  emit('setBudget', 0);
  budgetInput.value = '';
  isEditingBudget.value = false;
}
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <button
      @click="emit('copyLink')"
      class="w-full bg-[#836BC2]/10 text-[#836BC2] rounded-2xl py-4 font-semibold mb-3 hover:bg-[#836BC2]/20 transition flex items-center justify-center gap-2"
    >
      🔗 초대 링크 복사하기
    </button>

    <div v-if="members.length === 0" class="text-center text-slate-400 py-10">
      멤버 정보가 없습니다.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="text-2xl bg-slate-50 rounded-full w-12 h-12 flex items-center justify-center border border-slate-100 shadow-sm"
          >
            {{ member.icon }}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <p class="font-bold text-slate-900">{{ member.nickname }}</p>
              <span
                v-if="member.role === 'owner'"
                class="px-2 py-0.5 bg-[#836BC2]/10 text-[#836BC2] text-[10px] font-bold rounded-md"
                >방장</span
              >
            </div>
            <p class="text-xs text-slate-500">결제액: {{ member.amount }}원</p>
          </div>
        </div>
        <button
          v-if="member.role !== 'owner'"
          @click="emit('removeMember', member)"
          class="text-xs font-medium text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-lg transition"
        >
          내보내기
        </button>
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
