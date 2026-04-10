<script setup>
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog/index.js';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group/index.js';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useRecordStore } from '@/stores/record.js';
import { Input } from '@/components/ui/input/index.js';
import { Textarea } from '@/components/ui/textarea/index.js';
import { Button } from '@/components/ui/button/index.js';
import { Label } from '@/components/ui/label/index.js';
import DateTimePicker from '@/components/DateTimePicker.vue';
import { format } from 'date-fns';

const emit = defineEmits(['close']);

const dateTime = ref(new Date());

const recordStore = useRecordStore();
const selectedType = ref('income');
const selectedCategory = ref(null);
const title = ref('');
const amount = ref('');
const memo = ref('');

const categories = computed(() => {
  if (!selectedType.value) {
    return [];
  }
  if (selectedType.value === 'income') {
    return recordStore.incomeCategories;
  }
  if (selectedType.value === 'expense') {
    return recordStore.expenseCategories;
  }
});

watch(selectedType, (newValue) => {
  selectedCategory.value = null;
});

async function makeRecord() {
  try {
    await recordStore.makeRecord({
      type: selectedType.value,
      categoryId: selectedCategory.value.id,
      title: title.value,
      amount: Number(amount.value),
      date: format(dateTime.value, "yyyy-MM-dd'T'HH:mm:ss"),
      memo: memo.value,
    });
    emit('close');
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <DialogHeader class="mb-6">
    <DialogTitle class="text-xl font-semibold">수입 / 지출 추가</DialogTitle>
    <DialogDescription class="text-sm text-muted-foreground">
      새로운 내역을 입력해주세요
    </DialogDescription>
  </DialogHeader>

  <div class="space-y-5">
    <!-- 수입 / 지출 선택 -->
    <RadioGroup v-model="selectedType" class="grid grid-cols-2 gap-2">
      <Label
        for="income"
        class="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
        :class="
          selectedType === 'income'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : 'hover:bg-muted'
        "
      >
        <RadioGroupItem id="income" value="income" class="sr-only" />
        <TrendingUp class="w-4 h-4" />
        <span class="font-medium text-sm">수입</span>
      </Label>
      <Label
        for="expense"
        class="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
        :class="
          selectedType === 'expense'
            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
            : 'hover:bg-muted'
        "
      >
        <RadioGroupItem id="expense" value="expense" class="sr-only" />
        <TrendingDown class="w-4 h-4" />
        <span class="font-medium text-sm">지출</span>
      </Label>
    </RadioGroup>

    <!-- 금액 -->
    <div class="space-y-1.5">
      <Label for="amount" class="text-sm font-medium">금액</Label>
      <div class="relative">
        <Input
          id="amount"
          v-model="amount"
          type="number"
          placeholder="0"
          class="pr-8"
        />
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
        >
          원
        </span>
      </div>
    </div>

    <!-- 카테고리 -->
    <div class="space-y-1.5">
      <Label class="text-sm font-medium">카테고리</Label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="flex flex-col items-center justify-center gap-1 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted"
          :class="
            selectedCategory?.id === category.id
              ? selectedType === 'income'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              : ''
          "
          @click="selectedCategory = category"
        >
          <span class="text-xl">{{ category.icon }}</span>
          <span class="text-xs font-medium">{{ category.name }}</span>
        </button>
      </div>
    </div>

    <!-- 지출명 -->
    <div class="space-y-1.5">
      <Label for="title" class="text-sm font-medium">지출명</Label>
      <Input
        id="title"
        v-model="title"
        type="text"
        placeholder="예) 스타벅스 아메리카노"
      />
    </div>

    <div>
      <DateTimePicker v-model="dateTime" />
    </div>
    <!-- 메모 -->
    <div class="space-y-1.5">
      <Label for="memo" class="text-sm font-medium">
        메모
        <span class="ml-1 text-xs text-muted-foreground font-normal"
          >(선택)</span
        >
      </Label>
      <Textarea
        id="memo"
        v-model="memo"
        placeholder="메모를 입력해주세요"
        class="resize-none"
        rows="3"
      />
    </div>

    <!-- 버튼 -->
    <div class="flex gap-2 pt-1">
      <Button variant="outline" class="flex-1" @click="emit('close')">
        취소
      </Button>
      <Button
        @click.prevent="makeRecord"
        class="flex-1"
        :class="
          selectedType === 'income'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-rose-600 hover:bg-rose-700'
        "
      >
        추가하기
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
