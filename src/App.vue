<script setup>
import {useRecordStore} from "@/stores/record.js";

const recordStore = useRecordStore();
recordStore.fetchCategories();
</script>

<template>
  <RouterView/>
</template>

<style scoped></style>
