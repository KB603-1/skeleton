<script setup>
import {computed, ref, watch} from 'vue';
import {fromDate, getLocalTimeZone} from '@internationalized/date';
import {format} from 'date-fns';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const modelValue = defineModel({default: () => new Date()});

const open = ref(false);
const date = ref(fromDate(modelValue.value, getLocalTimeZone()));
const time = ref(format(modelValue.value, 'HH:mm:ss'));

const dateTooltip = computed(() => {
  return date ? format(date.value.toDate(getLocalTimeZone()), 'yyyy년 MM월 dd일')
      : '날짜를 선택해주세요.'
});


watch([date, time], () => {
  if (!date.value) return;
  const d = date.value.toDate(getLocalTimeZone());
  const [h, m, s] = time.value.split(':').map(Number);
  d.setHours(h, m, s);
  modelValue.value = d;
});
</script>

<template>
  <div class="mx-auto w-full flex flex-row gap-4">
    <!-- Date -->
    <div class="flex flex-1 min-w-0 flex-col gap-1.5">
      <Label for="date-picker">날짜<span class="text-red-500">*</span></Label>
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Input
              id="date-picker"
              variant="outline"
              class="w-full font-normal"
              v-model="dateTooltip"
          />
        </PopoverTrigger>
        <PopoverContent class="w-auto overflow-hidden p-0" align="start">
          <Calendar
              mode="single"
              :selected="date"
              caption-layout="dropdown"
              :default-month="date"
              locale="ko"
              @update:model-value="
              (v) => {
                date = v;
                open = false;
              }
            "
          />
        </PopoverContent>
      </Popover>
    </div>

    <!-- Time -->
    <div class="flex flex-1 min-w-0 flex-col gap-1.5">
      <Label for="time-picker">시각<span class="text-red-500">*</span></Label>
      <Input
          id="time-picker"
          v-model="time"
          type="time"
          step="1"
          class="w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  </div>
</template>
