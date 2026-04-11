<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';
import ShareCreateSheet from '@/components/share/ShareCreateSheet.vue';
import { useModalStore } from '@/stores/modal.js';
import MakeRecordModal from '@/components/MakeRecordModal.vue';
import { toast } from 'vue-sonner';
import { copyToClipboard } from '@/utils/clipboard.js';

const router = useRouter();
const route = useRoute();
const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);
const modalStore = useModalStore();

const isFabOpen = ref(false);
const isCreateSheetOpen = ref(false);
const fabContainer = ref(null);

const toggleFab = () => {
  isFabOpen.value = !isFabOpen.value;
};

const closeFab = () => {
  isFabOpen.value = false;
};

// 라우터(탭 등) 이동 시 닫기
watch(route, () => {
  closeFab();
});

// 외부 요소 클릭 시 닫기
const handleClickOutside = (event) => {
  if (
    isFabOpen.value &&
    fabContainer.value &&
    !fabContainer.value.contains(event.target)
  ) {
    closeFab();
  }
};

const handleInviteFriend = () => {
  if (!currentGroup.value) return;
  try {
    const link = groupStore.generateInviteLink({
      groupId: currentGroup.value.id,
    });
    copyToClipboard(link, '초대 링크가 복사되었습니다!');
  } catch (e) {
    toast.error(e.message || '링크 생성 중 오류가 발생했습니다.');
  }
  closeFab();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const goToAddRecord = () => {
  modalStore.openModal(MakeRecordModal);
  closeFab();
};

const goToAddGroup = () => {
  isCreateSheetOpen.value = true;
  closeFab();
};

const handleCreateGroup = async (groupData) => {
  try {
    // ShareCreateSheet에서 넘겨준 데이터(title, icon)를 API 규격에 맞춰 스토어에 전달합니다.
    await groupStore.makeGroup({
      name: groupData.title,
      icon: groupData.icon,
      password: Math.random().toString(36).slice(-8),
    });
    toast.success('새로운 모임이 성공적으로 생성되었습니다! 🎉');
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.');
  }
};

const handleLeaveGroup = () => {
  if (!currentGroup.value) return;

  toast('모임 떠나기', {
    description: `정말로 '${currentGroup.value.name}' 모임을 떠나시겠습니까? 방장은 모임을 떠날 수 없습니다.`,
    action: {
      label: '떠나기',
      onClick: async () => {
        try {
          await groupStore.leaveGroup(currentGroup.value.id);
          toast.success('모임에서 성공적으로 탈퇴했습니다.');
          groupStore.changeCurrentGroup(null);
          router.push('/');
        } catch (e) {
          toast.error(e.message || '오류가 발생했습니다.');
        }
      },
    },
    cancel: {
      label: '취소',
    },
  });
  closeFab();
};
</script>

<template>
  <!-- 모임 생성 바텀 시트 모달 -->
  <ShareCreateSheet
    v-model="isCreateSheetOpen"
    @create-group="handleCreateGroup"
  />

  <div
    ref="fabContainer"
    class="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-50"
  >
    <!-- 서브 버튼 메뉴 (애니메이션 적용) -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div v-if="isFabOpen" class="relative flex flex-col items-end gap-3">
        <!-- 서브 버튼 뒷부분에만 적용되는 블러(Glass) 배경 -->
        <div
          class="absolute -inset-x-4 -top-4 -bottom-2 rounded-[2rem] bg-black/10 backdrop-opacity-sm border border-white/50 shadow-sm pointer-events-none -z-10 border-none"
        ></div>

        <!-- 공통: 수입/지출 추가 -->
        <button
          @click="goToAddRecord"
          class="w-44 flex items-center justify-between gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <span class="flex-1 text-center">수입/지출 추가</span>
          <div
            class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg shrink-0"
          >
            📝
          </div>
        </button>

        <!-- 공통: 모임 추가 -->
        <button
          @click="goToAddGroup"
          class="w-44 flex items-center justify-between gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <span class="flex-1 text-center">모임 추가</span>
          <div
            class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg shrink-0"
          >
            🤝
          </div>
        </button>

        <!-- 모임 모드일 때: 친구 추가 -->
        <button
          v-if="currentGroup"
          @click="handleInviteFriend"
          class="w-44 flex items-center justify-between gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <span class="flex-1 text-center">친구 초대</span>
          <div
            class="w-8 h-8 rounded-full bg-violet-100 text-red-500 flex items-center justify-center text-lg shrink-0"
          >
            👋
          </div>
        </button>

        <!-- 모임 모드일 때: 모임 떠나기 -->
        <button
          v-if="currentGroup"
          @click="handleLeaveGroup"
          class="w-44 flex items-center justify-between gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-red-500 hover:bg-red-50 transition"
        >
          <span class="flex-1 text-center">모임 떠나기</span>
          <div
            class="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-lg shrink-0"
          >
            👋
          </div>
        </button>
      </div>
    </transition>

    <!-- 메인 + 버튼 -->
    <button
      @click="toggleFab"
      class="w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out"
      :class="{ 'rotate-45 bg-slate-700': isFabOpen }"
    >
      <svg
        xmlns="http://www.apache.org/2000/svg"
        class="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</template>
