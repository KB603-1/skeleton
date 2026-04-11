<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'
import AlertError from '@/components/ui/alert/AlertError.vue'
import PigIcon from '@/components/PigIcon.vue'

const store = useUserStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const passwordFocused = ref(false)
const usernameFocused = ref(false)

async function signIn() {
  try {
    await store.login({ username: username.value, password: password.value })
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}

// 캐릭터 상태에 따라 애니메이션 변경
const characterAnimation = computed(() => ({
  animate: passwordFocused.value
    ? { rotate: [-5, 5, -5, 5, 0], transition: { duration: 300 } }
    : { rotate: [0, -3, 3, 0], transition: { duration: 2000, repeat: Infinity } },
}))
</script>

<template>
  <div class="login-bg">
    <!-- 배경 점들 -->
    <div class="dots-layer" aria-hidden="true">
      <span v-for="n in 20" :key="n" class="dot" :style="{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' }" />
    </div>

    <div class="login-wrap">
      <!-- 캐릭터 영역 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: -40, scale: 0.6 }"
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } }"
        class="char-area floating"
      >
        <Transition name="char-swap" mode="out-in">
          <!-- 비밀번호 포커스: 눈 가린 돼지 -->
          <div v-if="passwordFocused" key="shy" class="pig-wrap">
            <PigIcon variant="shy" />
          </div>

          <!-- 기본: 일반 돼지 -->
          <div v-else key="normal" class="pig-wrap" v-motion v-bind="characterAnimation">
            <PigIcon />
          </div>
        </Transition>
      </div>

      <!-- 타이틀 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 500 } }"
        class="title-area"
      >
        <h1 class="app-title">Timo</h1>
        <p class="app-sub">로그인하고 시작하세요</p>
      </div>

      <!-- 카드 폼 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 250, duration: 500 } }"
        class="form-card"
      >
        <form @submit.prevent="signIn">
          <!-- 아이디 -->
          <div class="field-wrap" :class="{ focused: usernameFocused }">
            <div class="field-icon-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              v-model="username"
              type="text"
              placeholder="아이디"
              class="field-input"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
            />
            <Transition name="glow-fade">
              <span v-if="usernameFocused" class="field-glow" />
            </Transition>
          </div>

          <!-- 비밀번호 -->
          <div class="field-wrap" :class="{ focused: passwordFocused }">
            <div class="field-icon-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              v-model="password"
              type="password"
              placeholder="비밀번호"
              class="field-input"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false"
            />
            <Transition name="glow-fade">
              <span v-if="passwordFocused" class="field-glow" />
            </Transition>
          </div>


          <AlertError v-if="errorMessage" class="mt-3" :message="errorMessage" />

          <!-- 로그인 버튼 -->
          <button type="submit" class="login-btn">
            <span class="btn-shimmer" />
            로그인
          </button>

          <!-- 하단 링크 -->
          <div class="bottom-links">
            <button type="button" class="link-btn">비밀번호 찾기</button>
            <button type="button" class="link-btn" @click="router.push('/signUp')">회원가입</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100dvh;
  background: #7c5cbf;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 배경 점 */
.dots-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dot {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

/* 전체 컨텐츠 */
.login-wrap {
  width: 100%;
  max-width: 420px;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* 캐릭터 */
.floating {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.char-area {
  width: 120px;
  height: 134px;
  margin-bottom: 24px;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25));
}
.pig-wrap {
  width: 100%;
  height: 100%;
}

/* 캐릭터 전환 */
.char-swap-enter-active,
.char-swap-leave-active {
  transition: all 0.25s ease;
}
.char-swap-enter-from {
  opacity: 0;
  transform: scale(0.7) rotate(-10deg);
}
.char-swap-leave-to {
  opacity: 0;
  transform: scale(0.7) rotate(10deg);
}

/* 타이틀 */
.title-area {
  text-align: center;
  margin-bottom: 36px;
}
.app-title {
  font-family: 'Nunito', 'Arial Rounded MT Bold', sans-serif;
  font-size: 52px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0 0 8px;
}
.app-sub {
  font-size: 15px;
  color: rgba(255,255,255,0.75);
  margin: 0;
}

/* 폼 카드 */
.form-card {
  width: 100%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 24px;
  padding: 28px 24px 24px;
}

/* 인풋 필드 */
.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.14);
  border-radius: 14px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: background 0.2s;
}
.field-wrap.focused {
  background: rgba(255,255,255,0.22);
}
.field-icon-wrap {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.field-icon {
  width: 18px;
  height: 18px;
  color: rgba(255,255,255,0.55);
  display: block;
}
.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px 16px 16px 12px;
  font-size: 15px;
  color: white;
}
.field-input::placeholder {
  color: rgba(255,255,255,0.45);
}

/* 포커스 글로우 */
.field-glow {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.35);
  pointer-events: none;
}
.glow-fade-enter-active,
.glow-fade-leave-active {
  transition: opacity 0.2s ease;
}
.glow-fade-enter-from,
.glow-fade-leave-to {
  opacity: 0;
}

/* 로그인 버튼 */
.login-btn {
  position: relative;
  width: 100%;
  padding: 17px;
  background: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #7c5cbf;
  cursor: pointer;
  margin-top: 6px;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.login-btn:active {
  transform: scale(0.97);
}
.login-btn:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

/* 버튼 shimmer (순수 CSS) */
.btn-shimmer {
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(124, 92, 191, 0.12) 50%,
    transparent 100%
  );
  animation: shimmer 2.4s infinite;
}
@keyframes shimmer {
  0%   { left: -75%; }
  100% { left: 130%; }
}

/* 하단 링크 */
.bottom-links {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}
.link-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.link-btn:hover {
  color: white;
}
</style>
