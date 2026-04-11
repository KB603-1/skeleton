<script setup>
defineProps({
  // 'normal' | 'shy' (비밀번호 포커스 시 눈 가린 버전)
  variant: {
    type: String,
    default: 'normal',
  },
  eyeColor: {
    type: String,
    default: '#7c5cbf',
  },
  noseSpotColor: {
    type: String,
    default: '#b09ddb',
  },
  bodyColor: {
    type: String,
    default: 'white',
  },
  showEarTag: {
    type: Boolean,
    default: true,
  },
  earTagColor: {
    type: String,
    default: '#7c5cbf',
  },
})
</script>

<template>
  <svg viewBox="0 0 100 112" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <!-- 귀 -->
    <circle cx="24" cy="26" r="18" :fill="bodyColor" />
    <circle cx="76" cy="26" r="18" :fill="bodyColor" />
    <!-- 귀 태그 -->
    <rect v-if="showEarTag" x="68" y="11" width="16" height="6" rx="3" :fill="earTagColor" />

    <!-- 몸 -->
    <circle cx="50" cy="68" r="44" :fill="bodyColor" />

    <!-- 눈 감은 버전 (shy) -->
    <template v-if="variant === 'shy'">
      <path d="M31 58 Q37 52 43 58" :stroke="eyeColor" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M57 58 Q63 52 69 58" :stroke="eyeColor" stroke-width="3" stroke-linecap="round" fill="none" />
    </template>

    <!-- 일반 눈 -->
    <template v-else>
      <circle cx="37" cy="58" r="5.5" :fill="eyeColor" />
      <circle cx="63" cy="58" r="5.5" :fill="eyeColor" />
    </template>

    <!-- 코 -->
    <ellipse cx="50" cy="76" rx="14" ry="11" fill="#e0ccf5" />
    <circle cx="44" cy="77" r="3.5" :fill="noseSpotColor" />
    <circle cx="56" cy="77" r="3.5" :fill="noseSpotColor" />

    <!-- 다리 -->
    <rect x="32" y="106" width="16" height="10" rx="5" :fill="bodyColor" />
    <rect x="52" y="106" width="16" height="10" rx="5" :fill="bodyColor" />
  </svg>
</template>
