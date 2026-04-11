<script setup>
import RecentTransactions from '@/components/main/RecentTransactions.vue';
import { useGroupStore } from '@/stores/group';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import GroupInfo from '@/components/GroupInfo.vue';
import MyInfo from '@/components/MyInfo.vue';
import GroupDrawer from '@/components/GroupDrawer.vue';
import TotalExpenseCard from '@/components/main/TotalExpenseCard.vue';

import BudgetGoalCard from '@/components/main/BudgetGoalCard.vue';
import GroupNoticeCard from '@/components/main/GroupNoticeCard.vue';

const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const userName = computed(() => user.value?.nickname || '사용자');
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

  <!-- 총 지출 영역 -->
  <TotalExpenseCard />

  <!-- 개인: 예산 목표 카드 / 그룹: 공지사항 카드 -->
  <BudgetGoalCard v-if="!currentGroup" />
  <GroupNoticeCard v-if="currentGroup" />

  <!-- 개인 모드: 소비 유형 카드 -->
  <MyInfo v-if="!currentGroup" />

  <!-- 모임 모드: 캐러셀 -->
  <GroupInfo v-if="currentGroup" />

  <!-- 최근 내역 -->
  <RecentTransactions />

  <!-- 플로팅 액션 버튼 -->
  <FloatingActionButton />
</template>
