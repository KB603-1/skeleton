<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import api from '@/plugin/api.js';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog/index.js';
import { Button } from '@/components/ui/button/index.js';

const props = defineProps({
  userId: { type: String, required: true },
});
const emit = defineEmits(['close']);

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const error = ref('');

async function deleteAccount() {
  loading.value = true;
  error.value = '';
  try {
    await api.delete(`/users/${props.userId}`);
    userStore.logout();
    router.push('/login');
  } catch (e) {
    error.value = '회원 탈퇴 중 오류가 발생했습니다.';
    loading.value = false;
  }
}
</script>

<template>
  <DialogHeader>
    <DialogTitle>회원 탈퇴</DialogTitle>
    <DialogDescription>탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</DialogDescription>
  </DialogHeader>

  <div class="space-y-4 pt-2">
    <p v-if="error" class="text-destructive text-sm">{{ error }}</p>

    <div class="flex gap-2 justify-end">
      <Button variant="outline" @click="emit('close')">취소</Button>
      <Button variant="destructive" @click="deleteAccount" :disabled="loading">
        {{ loading ? '처리 중...' : '탈퇴하기' }}
      </Button>
    </div>
  </div>
</template>
