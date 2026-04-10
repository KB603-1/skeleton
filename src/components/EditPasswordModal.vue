<script setup>
import { ref } from 'vue';
import api from '@/plugin/api.js';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog/index.js';
import { Input } from '@/components/ui/input/index.js';
import { Button } from '@/components/ui/button/index.js';
import { Label } from '@/components/ui/label/index.js';

const props = defineProps({
  userId: { type: String, required: true },
});
const emit = defineEmits(['close']);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = '모든 항목을 입력해주세요.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = '새 비밀번호가 일치하지 않습니다.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get(`/users/${props.userId}`);
    if (res.data.password !== currentPassword.value) {
      error.value = '현재 비밀번호가 올바르지 않습니다.';
      return;
    }
    await api.patch(`/users/${props.userId}`, { password: newPassword.value });
    emit('close');
  } catch (e) {
    error.value = '비밀번호 변경 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DialogHeader>
    <DialogTitle>비밀번호 변경</DialogTitle>
    <DialogDescription>현재 비밀번호를 확인 후 변경합니다.</DialogDescription>
  </DialogHeader>

  <div class="space-y-4 pt-2">
    <div class="space-y-1.5">
      <Label for="current-pw">현재 비밀번호</Label>
      <Input id="current-pw" v-model="currentPassword" type="password" placeholder="현재 비밀번호" />
    </div>
    <div class="space-y-1.5">
      <Label for="new-pw">새 비밀번호</Label>
      <Input id="new-pw" v-model="newPassword" type="password" placeholder="새 비밀번호" />
    </div>
    <div class="space-y-1.5">
      <Label for="confirm-pw">새 비밀번호 확인</Label>
      <Input id="confirm-pw" v-model="confirmPassword" type="password" placeholder="새 비밀번호 확인" @keyup.enter="submit" />
    </div>

    <p v-if="error" class="text-destructive text-sm">{{ error }}</p>

    <div class="flex gap-2 justify-end">
      <Button variant="outline" @click="emit('close')">취소</Button>
      <Button @click="submit" :disabled="loading">
        {{ loading ? '변경 중...' : '변경' }}
      </Button>
    </div>
  </div>
</template>
