<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import { storeToRefs } from 'pinia';
import { User, Bell, UserX, ChevronRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useModalStore } from '@/stores/modal.js';
import EditProfileModal from '@/components/EditProfileModal.vue';
import EditUsernameModal from '@/components/EditUsernameModal.vue';
import EditPasswordModal from '@/components/EditPasswordModal.vue';
import DeleteAccountModal from '@/components/DeleteAccountModal.vue';

const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const modalStore = useModalStore();

function getUserId() {
  return userStore.user?.id;
}

function openEditModal() {
  modalStore.openModal(EditProfileModal, {
    userId: getUserId(),
    currentNickname: userStore.user?.nickname,
  });
}

function handleLogout() {
  userStore.logout();
  router.push('/login');
}

const menuItems = [
  {
    icon: User,
    label: '아이디 변경',
    action: () => modalStore.openModal(EditUsernameModal, { userId: getUserId() }),
  },
  {
    icon: Bell,
    label: '비밀번호 변경',
    action: () => modalStore.openModal(EditPasswordModal, { userId: getUserId() }),
  },
  {
    icon: UserX,
    label: '회원 탈퇴',
    action: () => modalStore.openModal(DeleteAccountModal, { userId: getUserId() }),
  },
];
</script>

<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <div
      class="bg-gradient-to-br from-violet-600 to-purple-500 px-5 pt-6 pb-16 relative overflow-hidden"
    >
      <div class="absolute -top-6 right-4 w-28 h-28 bg-white/10 rounded-full" />
      <div class="absolute top-4 right-16 w-14 h-14 bg-white/10 rounded-full" />
      <h1 class="text-white text-2xl font-bold relative z-10">마이페이지</h1>
    </div>

    <!-- Profile Card -->
    <Card class="mx-4 -mt-10 relative z-10 py-4">
      <CardContent class="flex items-center gap-4 p-4 pt-0 pb-0">
        <div class="relative">
          <Avatar class="size-16 rounded-2xl bg-violet-600">
            <AvatarFallback
              class="rounded-2xl bg-violet-600 text-white text-2xl font-bold"
            >
              {{ user?.nickname?.charAt(0) ?? '나' }}
            </AvatarFallback>
          </Avatar>
          <span
            class="absolute bottom-0 right-0 size-3.5 bg-green-400 rounded-full border-2 border-white"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-bold text-lg leading-tight truncate">
            {{ user?.nickname ?? '사용자' }}
          </p>
          <p class="text-muted-foreground text-sm truncate">
            {{ user?.username ?? '' }}
          </p>
          <span
            class="inline-flex items-center gap-1 mt-1 bg-violet-100 text-violet-600 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          >
            ✦ 절약 마스터
          </span>
        </div>

        <Button variant="secondary" size="sm" @click="openEditModal">편집</Button>
      </CardContent>
    </Card>

    <!-- Body -->
    <div class="flex-1 px-4 pt-6 pb-4 space-y-4">
      <!-- 계정 관리 -->
      <div>
        <p class="text-muted-foreground text-sm mb-2 px-1">계정 관리</p>
        <Card class="py-0 overflow-hidden gap-0">
          <template v-for="(item, i) in menuItems" :key="item.label">
            <button
              class="flex items-center gap-4 px-4 py-4 w-full hover:bg-accent transition-colors"
              @click="item.action"
            >
              <div
                class="size-9 bg-violet-50 rounded-xl flex items-center justify-center"
              >
                <component :is="item.icon" class="size-5 text-violet-500" />
              </div>
              <span class="flex-1 text-left font-medium">{{ item.label }}</span>
              <ChevronRight class="size-4 text-muted-foreground" />
            </button>
            <Separator v-if="i < menuItems.length - 1" />
          </template>
        </Card>
      </div>

      <!-- 로그아웃 -->
      <Button
        variant="ghost"
        class="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        @click="handleLogout"
      >
        로그아웃
      </Button>

      <p class="text-center text-muted-foreground text-sm">v1.0.0</p>
    </div>
  </div>
</template>
