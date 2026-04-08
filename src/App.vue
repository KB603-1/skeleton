<script setup>
import {useRecordStore} from "@/stores/record.js";

const recordStore = useRecordStore();
recordStore.fetchCategories();
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <RouterView/>
</template>

<style scoped></style>
