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
});
const emit = defineEmits(['close']);

const userStore = useUserStore();
const newUsername = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  if (!newUsername.value.trim()) {
    error.value = '아이디를 입력해주세요.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const check = await api.get(`/users?username=${newUsername.value.trim()}`);
    if (check.data.length > 0) {
      error.value = '이미 사용 중인 아이디입니다.';
      return;
    }
    await api.patch(`/users/${props.userId}`, { username: newUsername.value.trim() });
    emit('close');
  } catch (e) {
    error.value = '아이디 변경 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DialogHeader>
    <DialogTitle>아이디 변경</DialogTitle>
    <DialogDescription>변경할 아이디를 입력하세요.</DialogDescription>
  </DialogHeader>

  <div class="space-y-4 pt-2">
    <div class="space-y-1.5">
      <Label for="new-username">새 아이디</Label>
      <Input
        id="new-username"
        v-model="newUsername"
        placeholder="새 아이디 입력"
        @keyup.enter="submit"
      />
      <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    </div>

    <div class="flex gap-2 justify-end">
      <Button variant="outline" @click="emit('close')">취소</Button>
      <Button @click="submit" :disabled="loading">
        {{ loading ? '변경 중...' : '변경' }}
      </Button>
    </div>
  </div>
</template>
