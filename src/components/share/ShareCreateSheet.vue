<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue', 'create-group']);

const icons = ['👥', '🏠', '👩‍❤️‍👨', '🎓', '🚀', '🌊', '🎮'];
const selectedIcon = ref(icons[0]);
const groupName = ref('');

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      groupName.value = '';
      selectedIcon.value = icons[0];
    }
  },
);

const close = () => emit('update:modelValue', false);
const selectIcon = (icon) => {
  selectedIcon.value = icon;
};

const submit = () => {
  if (!groupName.value.trim()) return;

  // TODO: 추후 로그인 기능 개발 후 주석 제거
  //   // 로그인 상태 확인
  //   if (!userStore.isLoggedIn || !userStore.user) {
  //     alert('로그인이 필요합니다.');
  //     return;
  //   }

  emit('create-group', {
    id: Date.now(),
    icon: selectedIcon.value,
    title: groupName.value.trim(),
    members: [
      {
        // TODO; 추후 로그인 기능 개발 후 교체
        // name: userStore.user.nickname,
        // avatarUrl: '', // 추후 프로필 이미지 추가 가능
        // userId: userStore.user.id, // 멤버 식별용
        name: '김수현',
        avatarUrl: '', // 추후 프로필 이미지 추가 가능
        userId: 1, // 멤버 식별용
      },
    ],
    amount: 0,
  });

  close();
};
</script>

<template>
  <div v-if="props.modelValue" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="close" />

    <section
      class="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white p-5 pb-6 shadow-2xl max-h-[85vh] overflow-hidden"
    >
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-slate-900">새 모임 만들기</h2>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-700"
          @click="close"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div class="space-y-5 overflow-y-auto pr-1 max-h-[64vh]">
        <div>
          <p class="text-sm font-medium text-slate-500 mb-3">모임 아이콘</p>
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              v-for="icon in icons"
              :key="icon"
              type="button"
              @click="selectIcon(icon)"
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-2xl border transition',
                selectedIcon === icon
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300',
              ]"
            >
              {{ icon }}
            </button>
          </div>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-500 mb-2"
            for="group-name"
            >모임 이름</label
          >
          <input
            id="group-name"
            v-model="groupName"
            type="text"
            placeholder="예: 자취방 친구들, 우리 가족"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div class="bg-violet-50 rounded-3xl p-4">
          <p class="text-sm font-medium text-violet-700 mb-2">모임 생성 시</p>
          <p class="text-sm text-violet-600">
            • 본인이 모임장으로 참여합니다<br />
            • 추후 초대링크로 멤버들을 초대할 수 있습니다
          </p>
        </div>
      </div>

      <button
        type="button"
        class="mt-5 w-full rounded-3xl bg-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        @click="submit"
      >
        모임 만들기
      </button>
    </section>
  </div>
</template>

<style scoped></style>
