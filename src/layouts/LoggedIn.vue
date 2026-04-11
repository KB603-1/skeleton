<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import BottomNav from '@/components/BottomNav.vue';
import TopBar from '@/components/TopBar.vue';
import FloatingActionButton from '@/components/FloatingActionButton.vue';
import { Toaster } from '@/components/ui/sonner';

const router = useRouter();
const scrollContainer = ref(null);
const scrollPositions = ref({});

// 라우터 이동 직전에 현재 탭의 스크롤 위치를 저장합니다.
router.beforeEach((to, from) => {
  if (scrollContainer.value) {
    scrollPositions.value[from.path] = scrollContainer.value.scrollTop;
  }
});

// 라우터 이동이 완료된 후, 저장해둔 스크롤 위치로 복원합니다. (없으면 맨 위 0으로)
router.afterEach(async (to) => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollPositions.value[to.path] || 0;
  }
});
</script>

<template>
  <div class="h-full flex flex-col">
    <TopBar />
    <main
      ref="scrollContainer"
      class="flex-1 bg-[#f2f0fb] min-h-0 overflow-y-auto"
    >
      <div class="py-2 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <!-- KeepAlive를 적용하여 탭 간 이동 시 컴포넌트 상태와 DOM을 유지합니다 -->
        <RouterView v-slot="{ Component }">
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
    </main>
    <Toaster position="top-center" rich-colors :duration="2500" />
    <FloatingActionButton />
    <BottomNav class="fixed bottom-0 left-0 right-0 z-50" />
  </div>
</template>

<style scoped></style>
