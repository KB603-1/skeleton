<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  // 'list'는 월간 내역용, 'card'는 모임 탭용 디자인
  variant: {
    type: String,
    default: 'list',
  },
  showBorder: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit', 'delete', 'detail']);

function formatAmount(amount) {
  if (amount > 0) return `+${amount.toLocaleString()}원`;
  return `${amount.toLocaleString()}원`;
}
</script>

<template>
  <div
    class="flex items-center transition-colors cursor-pointer hover:bg-gray-50"
    @click.stop="emit('detail', item)"
    :class="[
      variant === 'card'
        ? 'bg-white rounded-2xl shadow-sm p-4 mb-3'
        : 'px-4 py-3',
      variant === 'list' && showBorder ? 'border-b border-gray-50' : '',
    ]"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-3 shrink-0"
      :class="'bg-[#f3eeff]'"
    >
      {{ item.icon }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate" :class="'text-gray-800'">
        {{ item.title }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5">
        <p
          class="text-xs"
          :class="item.isDeparted ? 'text-gray-400' : 'text-[#7c4dff]'"
        >
          {{ item.category }}
        </p>
        <span
          v-if="item.isDeparted"
          class="px-1.5 py-[2px] rounded bg-gray-100 text-gray-400 text-[10px] font-semibold"
        >
          나간 멤버
        </span>
      </div>
    </div>
    <span
      class="text-sm font-semibold mr-3"
      :class="item.amount < 0 ? 'text-red-400' : 'text-blue-500'"
    >
      {{ formatAmount(item.amount) }}
    </span>
    <div
      v-if="item.isOwner"
      class="flex items-center gap-2 shrink-0"
      T
      :class="{ invisible: !item.isOwner }"
    >
      <button
        @click.stop="emit('edit', item.id)"
        class="text-gray-300 hover:text-[#7c4dff]"
      >
        <Pencil class="w-4 h-4" />
      </button>
      <button
        @click.stop="emit('delete', item.id)"
        class="text-gray-300 hover:text-red-400"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
