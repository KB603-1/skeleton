<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/group.js';

const route = useRoute();
const router = useRouter();
const groupStore = useGroupStore();

const message = ref('초대 정보를 확인하는 중입니다...');

onMounted(async () => {
  const { groupId, password } = route.query;

  if (!groupId || !password) {
    alert('유효하지 않은 초대 링크입니다.');
    router.push('/');
    return;
  }

  try {
    message.value = '그룹에 참여하는 중입니다...';
    await groupStore.joinGroup({ groupId, password });

    alert('그룹 참여가 완료되었습니다! 🎉');

    // 가입 완료 후 해당 그룹으로 바로 이동시켜줍니다.
    groupStore.changeCurrentGroup(groupId);
    router.push('/group');
  } catch (e) {
    alert(e.message);
    // 이미 가입된 경우에도 해당 모임으로 바로 이동시켜줍니다.
    if (e.message === '이미 가입한 그룹입니다.') {
      groupStore.changeCurrentGroup(groupId);
      router.push('/group');
    } else {
      router.push('/');
    }
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-[#f4f3ff] flex flex-col items-center justify-center px-5 pb-20"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-sm text-center flex flex-col items-center gap-4 w-full max-w-sm"
    >
      <div
        class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl animate-bounce"
      >
        💌
      </div>
      <h2 class="text-xl font-bold text-gray-800">초대장 수락 중</h2>
      <p class="text-sm text-gray-500">{{ message }}</p>
    </div>
  </div>
</template>
