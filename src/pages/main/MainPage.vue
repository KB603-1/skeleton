<script setup>
import { useRouter } from 'vue-router';
import Card from '@/components/ui/card/Card.vue';
import RecentTransactions from '@/components/main/RecentTransactions.vue';
import { useRecordStore } from '@/stores/record';
import { useGroupStore } from '@/stores/group';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import GroupInfo from '@/components/GroupInfo.vue';
import MyInfo from '@/components/MyInfo.vue';
import FloatingActionButton from '@/components/FloatingActionButton.vue';
import GroupDrawer from '@/components/GroupDrawer.vue';
import TotalExpenseCard from '@/components/main/TotalExpenseCard.vue';

const router = useRouter();
const recordStore = useRecordStore();
const { expenses } = storeToRefs(recordStore);

const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const userName = computed(() => user.value?.nickname || '사용자');

// 소비 유형
const SPENDING_TYPES = {
  식비: { label: '식도락가형', emoji: '🍽️', desc: '맛있는 걸 아는 당신!' },
  교통비: { label: '이동왕형', emoji: '🚌', desc: '어디든 달려가는 당신!' },
  문화생활: { label: '문화인형', emoji: '🎭', desc: '삶의 여유를 아는 당신!' },
};

const spendingType = computed(() => {
  if (expenses.value.length === 0) return null;
  const totals = {};
  for (const e of expenses.value) {
    const name = e.category?.name ?? '기타';
    totals[name] = (totals[name] ?? 0) + e.amount;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  return (
    SPENDING_TYPES[top] ?? {
      label: '절약가형',
      emoji: '💰',
      desc: '알뜰살뜰 당신!',
    }
  );
});
</script>

<template>
  <!-- 상단 환영 인사 영역 -->
  <div class="mx-5 mb-5 mt-1 flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-500 mb-0.5">
        오늘도 현명한 하루 💸
      </p>
      <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
        <span class="text-purple-600">{{ userName }}</span
        >님, 안녕하세요!
      </h2>
    </div>
    <GroupDrawer />
  </div>

  <!-- 총 지출 영역 (개인 / 모임 모드 동적 레이아웃) -->
  <TotalExpenseCard />

  <!-- 동기부여 카드 -->
  <Card
    class="mx-5 mt-3 rounded-2xl border-0 px-4 py-3.5 gap-3 flex-row items-center shadow-sm"
  >
    <div
      class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0"
    >
      ✨
    </div>
    <div class="flex-1">
      <p class="text-sm font-semibold text-gray-800">잘 기록하고 있어요!</p>
      <p class="text-xs text-gray-400 mt-0.5">
        꾸준한 기록이 최고의 절약이에요
      </p>
    </div>
    <span class="text-purple-400 text-lg">✦</span>
  </Card>

  <!-- 개인 모드: 소비 유형 카드 -->
  <MyInfo v-if="!currentGroup" />

  <!-- 모임 모드: 캐러셀 (shadcn Carousel + embla) -->
  <GroupInfo v-if="currentGroup" />

  <!-- 최근 내역 -->
  <RecentTransactions />

  <!-- 우측 하단 플로팅 액션 버튼 (FAB) -->
  <FloatingActionButton />
</template>
