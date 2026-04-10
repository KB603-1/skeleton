import { defineStore } from 'pinia';
import { computed, markRaw, ref } from 'vue';

export const useModalStore = defineStore('modal', () => {
  const stack = ref([]); // [{ component, props }]
  const isOpen = computed(() => stack.value.length > 0);
  const current = computed(() => stack.value[stack.value.length - 1]);

  function openModal(c, p = {}) {
    stack.value.push({ component: markRaw(c), props: p });
  }

  function closeModal() {
    stack.value.pop();
  }

  function closeAll() {
    stack.value = [];
  }

  return { stack, isOpen, current, openModal, closeModal, closeAll };
});
