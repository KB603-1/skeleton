<script setup>
import { ref, computed } from 'vue';
import { useGroupStore } from '@/stores/group';
import { storeToRefs } from 'pinia';

const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);

const isEditing = ref(false);
const editText = ref('');

const isOwner = computed(() => currentGroup.value?.isOwner);
const notice = computed(() => currentGroup.value?.notice || '');

function startEdit() {
  editText.value = notice.value;
  isEditing.value = true;
}

async function saveNotice() {
  if (!currentGroup.value) return;
  try {
    await groupStore.updateNotice(currentGroup.value.id, editText.value.trim());
    isEditing.value = false;
  } catch (e) {
    alert(e.message);
  }
}
</script>

<template>
  <div class="mx-5 mt-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">

    <!-- 공지사항 있을 때 -->
    <template v-if="!isEditing">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shrink-0">
          📢
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-amber-500 mb-0.5">모임 공지</p>
          <p v-if="notice" class="text-sm text-gray-700 leading-snug whitespace-pre-line">{{ notice }}</p>
          <p v-else class="text-sm text-gray-400 italic">
            {{ isOwner ? '공지사항을 작성해보세요.' : '아직 공지사항이 없어요.' }}
          </p>
        </div>
        <!-- 방장만 수정 버튼 표시 -->
        <button
          v-if="isOwner"
          @click="startEdit"
          class="text-xs text-gray-400 hover:text-violet-500 transition shrink-0 mt-0.5"
        >
          {{ notice ? '수정' : '작성' }}
        </button>
      </div>
    </template>

    <!-- 편집 모드 -->
    <template v-else>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">📢</span>
        <p class="text-xs font-semibold text-amber-500">공지 작성</p>
      </div>
      <textarea
        v-model="editText"
        rows="3"
        placeholder="멤버들에게 전할 공지를 입력하세요"
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-700 resize-none outline-none focus:border-violet-400 transition"
      />
      <div class="flex gap-2 mt-2 justify-end">
        <button
          @click="isEditing = false"
          class="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg transition"
        >
          취소
        </button>
        <button
          @click="saveNotice"
          class="text-xs text-white bg-violet-600 hover:bg-violet-700 px-4 py-1.5 rounded-lg font-semibold transition"
        >
          저장
        </button>
      </div>
    </template>

  </div>
</template>
