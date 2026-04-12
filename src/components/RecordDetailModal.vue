<script setup>
import { useModalStore } from '@/stores/modal.js';
import { Pencil, Trash2 } from 'lucide-vue-next';
import EditRecordModal from '@/components/EditRecordModal.vue';
import { useRecordStore } from '@/stores/record.js';
import {format} from "date-fns";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const modalStore = useModalStore();
const recordStore = useRecordStore();

function formatAmount(amount) {
  if (amount > 0) return `+${amount.toLocaleString()}원`;
  return `${amount.toLocaleString()}원`;
}

function openEdit() {
  modalStore.closeModal();
  modalStore.openModal(EditRecordModal, { recordId: props.record.id });
}

async function deleteRecord() {
  await recordStore.deleteRecord(props.record.id);
  modalStore.closeModal();
}
</script>

<template>
  <div class="bg-white w-full">
    <div class="flex items-center justify-between px-6 border-b border-gray-50">
      <h2 class="text-lg font-bold text-gray-900">상세 내역</h2>
    </div>

    <div class="px-6 py-6 space-y-6">
      <div class="text-center">
        <div
          class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3"
          :class="'bg-[#f3eeff]'"
        >
          {{ record.icon }}
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-1">
          {{ record.title }}
        </h3>
        <p class="text-sm text-gray-500 mb-2">{{ record.category }}</p>
        <p
          class="text-3xl font-bold"
          :class="record.amount < 0 ? 'text-red-500' : 'text-blue-500'"
        >
          {{ formatAmount(record.amount) }}
        </p>
      </div>

      <div class="bg-gray-50 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-500">결제자</span>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-900">{{
              record.payerName
            }}</span>
            <span
              v-if="record.isDeparted"
              class="px-2 py-0.5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold"
            >
              나간 멤버
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-500">결제일시</span>
          <span class="text-sm font-bold text-gray-900">{{format(record.date, "yyyy년 MM월 dd일 hh시 mm분") }}</span>
        </div>
        <div class="space-y-2">
          <span class="text-sm font-medium text-gray-500">메모</span>
          <p
            class="text-sm font-medium text-gray-900 bg-white p-3 rounded-xl border border-gray-100 min-h-[3rem] whitespace-pre-wrap break-words"
          >
            {{ record.memo || '메모가 없습니다.' }}
          </p>
        </div>
      </div>

      <!-- 수정/삭제 버튼 -->
      <div v-if="record.isOwner" class="flex gap-2 pt-2">
        <button
          @click="openEdit"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-500 text-blue-500 font-medium text-sm hover:bg-blue-50 transition"
        >
          <Pencil class="w-4 h-4" />
          수정
        </button>
        <button
          @click="deleteRecord"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 font-medium text-sm hover:bg-red-50 transition"
        >
          <Trash2 class="w-4 h-4" />
          삭제
        </button>
      </div>
    </div>
  </div>
</template>
