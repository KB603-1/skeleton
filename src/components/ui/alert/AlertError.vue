<script setup>

import {Alert, AlertTitle} from "@/components/ui/alert/index.js";
</script>

<template>
  <Alert
      class="mt-4 bg-red-50 border-red-50"
  >
    <AlertTitle class="text-red-400">
      <slot />
    </AlertTitle>
  </Alert>
</template>