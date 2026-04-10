<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.js';
import api from '@/plugin/api.js';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog/index.js';
import { Input } from '@/components/ui/input/index.js';
import { Button } from '@/components/ui/button/index.js';
import { Label } from '@/components/ui/label/index.js';

const props = defineProps({
  userId: { type: String, required: true },
  currentNickname: { type: String, default: '' },
});
const emit = defineEmits(['close']);

const userStore = useUserStore();

const nickname = ref(props.currentNickname);
const error = ref('');
const loading = ref(false);

async function submit() {
  if (!nickname.value.trim()) {
    error.value = '닉네임을 입력해주세요.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await api.patch(`/users/${props.userId}`, { nickname: nickname.value.trim() });
    userStore.user.nickname = nickname.value.trim();
    emit('close');
  } catch (e) {
    error.value = '닉네임 변경 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DialogHeader>
    <DialogTitle>프로필 편집</DialogTitle>
    <DialogDescription>사용할 닉네임을 입력하세요.</DialogDescription>
  </DialogHeader>

  <div class="space-y-4 pt-2">
    <div class="space-y-1.5">
      <Label for="nickname">닉네임</Label>
      <Input
        id="nickname"
        v-model="nickname"
        placeholder="닉네임 입력"
        @keyup.enter="submit"
      />
      <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    </div>

    <div class="flex gap-2 justify-end">
      <Button variant="outline" @click="emit('close')">취소</Button>
      <Button @click="submit" :disabled="loading">
        {{ loading ? '저장 중...' : '저장' }}
      </Button>
    </div>
  </div>
</template>
