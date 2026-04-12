<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import { storeToRefs } from 'pinia';
import { Bell, UserX, ChevronRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useModalStore } from '@/stores/modal.js';
import EditProfileModal from '@/components/EditProfileModal.vue';
import EditPasswordModal from '@/components/EditPasswordModal.vue';
import DeleteAccountModal from '@/components/DeleteAccountModal.vue';
import { ref, computed, watch } from 'vue';
import { useGroupStore } from '@/stores/group.js';
import { toast } from 'vue-sonner';

const router = useRouter();
const userStore = useUserStore();
const groupStore = useGroupStore();
const { currentGroup } = storeToRefs(groupStore);
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

// ── 월 예산 설정 ──────────────────────────────────
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const savedBudget = ref(0);
const budgetInput = ref('');
const isEditingBudget = ref(false);

watch(
  user,
  (u) => {
    if (u) {
      const val = u.budgetGoal || 0;
      savedBudget.value = val;
      budgetInput.value = val ? val.toLocaleString() : '';
      isEditingBudget.value = val === 0;
    }
  },
  { immediate: true },
);

const displayBudgetInput = computed(() =>
  budgetInput.value
    ? Number(budgetInput.value.replace(/[^0-9]/g, '')).toLocaleString()
    : '',
);

function onBudgetInput(e) {
  const digits = e.target.value.replace(/[^0-9]/g, '');
  budgetInput.value = digits;
  e.target.value = digits ? Number(digits).toLocaleString() : '';
}

async function saveBudget() {
  const val = Number(budgetInput.value.replace(/[^0-9]/g, ''));
  if (!val || val <= 0) return;

  try {
    await userStore.updateBudgetGoal(val);
    savedBudget.value = val;
    isEditingBudget.value = false;
    toast.success('예산 목표가 저장되었습니다.');
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.');
  }
}

async function clearBudget() {
  try {
    await userStore.updateBudgetGoal(0);
    savedBudget.value = 0;
    budgetInput.value = '';
    isEditingBudget.value = true;
    toast.success('예산 목표가 삭제되었습니다.');
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.');
  }
}

// ── 그룹 예산 설정 ──────────────────────────────────
const savedGroupBudget = ref(0);
const groupBudgetInput = ref('');
const isEditingGroupBudget = ref(false);

watch(
  currentGroup,
  (g) => {
    if (g) {
      const val = g.budgetGoal || 0;
      savedGroupBudget.value = val;
      groupBudgetInput.value = val ? String(val) : '';
      isEditingGroupBudget.value = val === 0;
    }
  },
  { immediate: true },
);

const displayGroupBudgetInput = computed(() =>
  groupBudgetInput.value
    ? Number(groupBudgetInput.value.replace(/[^0-9]/g, '')).toLocaleString()
    : '',
);

function onGroupBudgetInput(e) {
  const digits = e.target.value.replace(/[^0-9]/g, '');
  groupBudgetInput.value = digits;
  e.target.value = digits ? Number(digits).toLocaleString() : '';
}

async function saveGroupBudget() {
  const val = Number(groupBudgetInput.value.replace(/[^0-9]/g, ''));
  if (!val || val <= 0) return;
  try {
    await groupStore.updateGroupBudget(currentGroup.value.id, val);
    savedGroupBudget.value = val;
    isEditingGroupBudget.value = false;
    toast.success('그룹 예산 목표가 저장되었습니다.');
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.');
  }
}

async function clearGroupBudget() {
  try {
    await groupStore.updateGroupBudget(currentGroup.value.id, 0);
    savedGroupBudget.value = 0;
    groupBudgetInput.value = '';
    isEditingGroupBudget.value = true;
    toast.success('그룹 예산 목표가 삭제되었습니다.');
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.');
  }
}

const menuItems = [
  {
    icon: Bell,
    label: '비밀번호 변경',
    action: () =>
      modalStore.openModal(EditPasswordModal, { userId: getUserId() }),
  },
  {
    icon: UserX,
    label: '회원 탈퇴',
    action: () =>
      modalStore.openModal(DeleteAccountModal, { userId: getUserId() }),
  },
];
</script>

<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <div
      class="bg-[#836BC2] px-5 pt-6 pb-16 relative overflow-hidden"
    >
      <div class="absolute -top-6 right-4 w-28 h-28 bg-white/10 rounded-full" />
      <div class="absolute top-4 right-16 w-14 h-14 bg-white/10 rounded-full" />
      <h1 class="text-white text-2xl font-bold relative z-10">마이페이지</h1>
    </div>

    <!-- Profile Card -->
    <Card class="mx-4 -mt-10 relative z-10 py-4">
      <CardContent class="flex items-center gap-4 p-4 pt-0 pb-0">
        <div class="relative">
          <Avatar class="size-16 rounded-2xl bg-[#836BC2]">
            <AvatarFallback
              class="rounded-2xl bg-[#836BC2] text-white text-2xl font-bold"
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

        <Button variant="secondary" size="sm" @click="openEditModal"
          >편집</Button
        >
      </CardContent>
    </Card>

    <!-- Body -->
    <div class="flex-1 px-4 pt-6 pb-4 space-y-4">
      <!-- 이번 달 예산 목표 (개인 모드에서만) -->
      <div v-if="!currentGroup">
        <p class="text-muted-foreground text-sm mb-2 px-1">이번 달 예산 목표</p>
        <Card class="py-0 overflow-hidden">
          <CardContent class="p-4">
            <!-- 설정 모드 -->
            <div v-if="isEditingBudget" class="space-y-3">
              <p class="text-sm text-gray-500">
                {{
                  savedBudget === 0
                    ? '예산을 설정하면 홈에서 오늘 쓸 수 있는 금액을 알려드려요!'
                    : '예산 목표를 수정해요'
                }}
              </p>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    type="text"
                    inputmode="numeric"
                    placeholder="예: 500,000"
                    :value="displayBudgetInput"
                    @input="onBudgetInput"
                    class="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                    >원</span
                  >
                </div>
                <Button
                  size="sm"
                  @click="saveBudget"
                  class="bg-violet-600 hover:bg-violet-700 text-white"
                  >저장</Button
                >
                <Button
                  v-if="savedBudget > 0"
                  size="sm"
                  variant="ghost"
                  @click="isEditingBudget = false"
                  >취소</Button
                >
              </div>
            </div>

            <!-- 설정됨 -->
            <div v-else class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-400 mb-0.5">
                  {{ year }}년 {{ month }}월 예산
                </p>
                <p class="text-lg font-bold text-gray-800">
                  {{ savedBudget.toLocaleString()
                  }}<span class="text-sm font-medium text-gray-500 ml-1"
                    >원</span
                  >
                </p>
              </div>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  @click="isEditingBudget = true"
                  >수정</Button
                >
                <Button
                  size="sm"
                  variant="ghost"
                  class="text-rose-400 hover:text-rose-500 hover:bg-rose-50"
                  @click="clearBudget"
                  >삭제</Button
                >
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 그룹 예산 목표 (그룹 모드 전체 멤버) -->
      <div v-if="currentGroup">
        <p class="text-muted-foreground text-sm mb-2 px-1">그룹 예산 목표</p>
        <Card class="py-0 overflow-hidden">
          <CardContent class="p-4">
            <!-- 설정 모드 -->
            <div v-if="isEditingGroupBudget" class="space-y-3">
              <p class="text-sm text-gray-500">
                {{ savedGroupBudget === 0 ? '그룹 예산을 설정하면 홈에서 1인당 하루 권장 금액을 알려드려요!' : '그룹 예산 목표를 수정해요' }}
              </p>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    type="text"
                    inputmode="numeric"
                    placeholder="예: 500,000"
                    :value="displayGroupBudgetInput"
                    @input="onGroupBudgetInput"
                    class="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                </div>
                <Button size="sm" @click="saveGroupBudget" class="bg-[#836BC2] hover:bg-[#836BC2]/90 text-white">저장</Button>
                <Button v-if="savedGroupBudget > 0" size="sm" variant="ghost" @click="isEditingGroupBudget = false">취소</Button>
              </div>
            </div>

            <!-- 설정됨 -->
            <div v-else class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-400 mb-0.5">{{ year }}년 {{ month }}월 그룹 예산</p>
                <p class="text-lg font-bold text-gray-800">
                  {{ savedGroupBudget.toLocaleString() }}<span class="text-sm font-medium text-gray-500 ml-1">원</span>
                </p>
              </div>
              <div class="flex gap-2">
                <Button size="sm" variant="outline" @click="isEditingGroupBudget = true">수정</Button>
                <Button size="sm" variant="ghost" class="text-rose-400 hover:text-rose-500 hover:bg-rose-50" @click="clearGroupBudget">삭제</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
