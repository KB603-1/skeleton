<script setup>
import { computed } from 'vue';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const props = defineProps({
  icon: String,
  title: String,
  members: {
    type: Array,
    default: () => [],
  },
  amount: Number,
});

const displayMembers = computed(() => props.members.slice(0, 3));
</script>

<template>
  <div
    class="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-start gap-3 flex-1">
        <div class="text-4xl">{{ icon }}</div>

        <div>
          <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>

          <div class="flex items-center gap-3 mt-3">
            <div class="flex -space-x-2">
              <Avatar
                v-for="(member, idx) in displayMembers"
                :key="`${member.name}-${idx}`"
                class="border-2 border-white shadow-sm"
              >
                <AvatarImage
                  v-if="member.avatarUrl"
                  :src="member.avatarUrl"
                  :alt="member.name"
                />
                <AvatarFallback>
                  {{ member.name ? member.name.charAt(0) : '?' }}
                </AvatarFallback>
              </Avatar>
            </div>

            <span class="text-sm text-slate-500"
              >{{ props.members.length }}명</span
            >
          </div>
        </div>
      </div>

      <div class="text-right">
        <p class="text-xl font-bold text-purple-600">
          {{ amount.toLocaleString() }}원
        </p>
        <p class="text-xs text-slate-400 mt-1">{{ props.members.length }}인</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
