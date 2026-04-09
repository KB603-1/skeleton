<script setup>
import {useModalStore} from "@/stores/modal.js";
import {Dialog, DialogContent} from "@/components/ui/dialog/index.js";

const modalStore = useModalStore();
</script>


<template>
  <template v-for="(modal, index) in modalStore.stack" :key="index">
    <Dialog :open="true" @update:open="modalStore.closeModal">
      <DialogContent class="max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <component
            :is="modal.component"
            v-bind="modal.props"
            @close="modalStore.closeModal"
        />
      </DialogContent>
    </Dialog>
  </template>
</template>

<style scoped>

</style>