<script setup>
import ShareListCard from '@/components/share/ShareListCard.vue';
import ShareListHeader from '@/components/share/ShareListHeader.vue';
import ShareCreateSheet from '@/components/share/ShareCreateSheet.vue';
import { ref } from 'vue';

const groups = ref([
  {
    id: 1,
    icon: '🏠',
    title: '자취방 친구들',
    members: [
      { name: '채원', avatarUrl: '' },
      { name: '민수', avatarUrl: '' },
      { name: '지수', avatarUrl: '' },
    ],
    amount: 175000,
  },
  {
    id: 2,
    icon: '💑',
    title: '커플 가계부',
    members: [
      { name: '수진', avatarUrl: '' },
      { name: '태현', avatarUrl: '' },
    ],
    amount: 127000,
  },
]);

const sheetOpen = ref(false);

const handleAddGroup = () => {
  sheetOpen.value = true;
};

const handleCreateGroup = (group) => {
  groups.value.unshift(group);
};
</script>

<template>
  <div class="min-h-screen bg-[#f4f3ff] pb-28">
    <!-- 헤더 -->
    <ShareListHeader @addGroup="handleAddGroup" />

    <!-- 리스트 -->
    <main class="px-5 py-6 space-y-4">
      <ShareListCard
        v-for="group in groups"
        :key="group.id"
        :icon="group.icon"
        :title="group.title"
        :members="group.members"
        :amount="group.amount"
      />
    </main>

    <ShareCreateSheet v-model="sheetOpen" @create-group="handleCreateGroup" />
  </div>
</template>

<style scoped></style>
