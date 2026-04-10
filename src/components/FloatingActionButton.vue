<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';
import ShareCreateSheet from '@/components/share/ShareCreateSheet.vue';
import { useModalStore } from '@/stores/modal.js';
import MakeRecordModal from '@/components/MakeRecordModal.vue';

const router = useRouter();
const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);
const modalStore = useModalStore();

const isFabOpen = ref(false);
const isCreateSheetOpen = ref(false);

const toggleFab = () => {
  isFabOpen.value = !isFabOpen.value;
};

const goToAddRecord = () => {
  modalStore.openModal(MakeRecordModal);
  isFabOpen.value = false;
};

const goToAddGroup = () => {
  isCreateSheetOpen.value = true;
  isFabOpen.value = false;
};

const handleCreateGroup = async (groupData) => {
  try {
    // ShareCreateSheet에서 넘겨준 데이터(title, icon)를 API 규격에 맞춰 스토어에 전달합니다.
    await groupStore.makeGroup({
      name: groupData.title,
      icon: groupData.icon,
      password: Math.random().toString(36).slice(-8),
    });
    alert('새로운 모임이 성공적으로 생성되었습니다! 🎉');
  } catch (e) {
    alert(e.message);
  }
};

const handleLeaveGroup = async () => {
  if (!currentGroup.value) return;

  if (
    confirm(
      `정말로 '${currentGroup.value.name}' 모임을 떠나시겠습니까?\n방장은 모임을 떠날 수 없습니다.`,
    )
  ) {
    try {
      await groupStore.leaveGroup(currentGroup.value.id);
      alert('모임에서 성공적으로 탈퇴했습니다.');

      // 탈퇴 성공 시, 개인 가계부 모드로 변경하고 홈으로 이동합니다.
      groupStore.changeCurrentGroup(null);
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  }
  isFabOpen.value = false;
};
</script>

<template>
  <!-- 모임 생성 바텀 시트 모달 -->
  <ShareCreateSheet
    v-model="isCreateSheetOpen"
    @create-group="handleCreateGroup"
  />

  <div class="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-50">
    <!-- 서브 버튼 메뉴 (애니메이션 적용) -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div v-if="isFabOpen" class="flex flex-col items-end gap-3">
        <!-- 공통: 모임 추가 -->
        <button
          @click="goToAddGroup"
          class="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <span>모임 추가</span>
          <div
            class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg"
          >
            🤝
          </div>
        </button>

        <!-- 공통: 수입/지출 추가 -->
        <button
          @click="goToAddRecord"
          class="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <span>수입/지출 추가</span>
          <div
            class="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg"
          >
            📝
          </div>
        </button>

        <!-- 모임 모드일 때: 모임 떠나기 -->
        <button
          v-if="currentGroup"
          @click="handleLeaveGroup"
          class="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-bold text-red-500 hover:bg-red-50 transition"
        >
          <span>모임 떠나기</span>
          <div
            class="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-lg"
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
