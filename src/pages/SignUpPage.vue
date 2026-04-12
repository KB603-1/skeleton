<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'
import AlertError from '@/components/ui/alert/AlertError.vue'
import PigIcon from '@/components/PigIcon.vue'

const store = useUserStore()
const router = useRouter()
const nickname = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')

const nicknameFocused = ref(false)
const usernameFocused = ref(false)
const passwordFocused = ref(false)
const passwordConfirmFocused = ref(false)

// 진행도: 각 필드 채워질 때마다 25%씩
const progress = computed(() => {
  let count = 0
  if (nickname.value.trim()) count++
  if (username.value.trim()) count++
  if (password.value.trim()) count++
  if (passwordConfirm.value.trim()) count++
  return count * 25
})

const regex = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/

async function signUp() {
  try {
    nickname.value = nickname.value.trim()
    username.value = username.value.trim()
    password.value = password.value.trim()
    passwordConfirm.value = passwordConfirm.value.trim()

    if (!nickname.value) throw new Error('사용할 닉네임을 입력해주세요.')
    if (!username.value) throw new Error('사용할 아이디를 입력해주세요.')
    if (!password.value) throw new Error('사용할 비밀번호를 입력해주세요.')
    if (!passwordConfirm.value) throw new Error('비밀번호 확인을 입력해주세요.')
    if (!regex.test(username.value)) throw new Error('아이디는 영문 + 숫자 조합이어야 합니다.')
    if (!regex.test(password.value)) throw new Error('비밀번호는 영문 + 숫자 조합이어야 합니다.')
    if (password.value !== passwordConfirm.value) throw new Error('비밀번호가 일치하지 않습니다.')

    await store.register({ nickname: nickname.value, username: username.value, password: password.value })
    router.push('/login')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="login-bg">
    <div class="dots-layer" aria-hidden="true"></div>

    <div class="login-wrap">
      <!-- 뒤로가기 -->
      <button class="back-btn" type="button" @click="router.push('/login')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        로그인으로
      </button>

      <!-- 캐릭터 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: -40, scale: 0.6 }"
        :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } }"
        class="char-area floating"
      >
        <PigIcon :variant="(passwordFocused || passwordConfirmFocused) ? 'shy' : 'normal'" />
      </div>

      <!-- 타이틀 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 500 } }"
        class="title-area"
      >
        <h1 class="app-title">Timo와 함께하기</h1>
        <p class="app-sub">새로운 계정을 만들어보세요</p>

        <!-- 진행도 바 -->
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progress + '%' }" />
          </div>
          <span class="progress-label">{{ progress }}% 완료</span>
        </div>
      </div>

      <!-- 폼 카드 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 250, duration: 500 } }"
        class="form-card"
      >
        <form @submit.prevent="signUp">
          <!-- 닉네임 -->
          <div class="field-wrap" :class="{ focused: nicknameFocused }">
            <div class="field-icon-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 12c2.7 0 4-1.3 4-4s-1.3-4-4-4-4 1.3-4 4 1.3 4 4 4z"/>
                <path d="M4 20c0-3 3.6-5 8-5s8 2 8 5"/>
              </svg>
            </div>
            <input
              v-model="nickname"
              type="text"
              placeholder="닉네임"
              class="field-input"
              @focus="nicknameFocused = true"
              @blur="nicknameFocused = false"
            />
            <Transition name="glow-fade">
              <span v-if="nicknameFocused" class="field-glow" />
            </Transition>
          </div>

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

          <!-- 비밀번호 확인 -->
          <div class="field-wrap" :class="{ focused: passwordConfirmFocused }">
            <div class="field-icon-wrap">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              v-model="passwordConfirm"
              type="password"
              placeholder="비밀번호 확인"
              class="field-input"
              @focus="passwordConfirmFocused = true"
              @blur="passwordConfirmFocused = false"
            />
            <Transition name="glow-fade">
              <span v-if="passwordConfirmFocused" class="field-glow" />
            </Transition>
          </div>

          <AlertError v-if="errorMessage" class="mt-3" :message="errorMessage" />

          <!-- 가입 버튼 -->
          <button type="submit" class="login-btn">
            <span class="btn-shimmer" />
            가입하기
          </button>
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

@media (max-height: 780px) {
  .login-bg {
    align-items: flex-start;
    overflow-y: auto;
  }
}

.dots-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-wrap {
  width: 100%;
  max-width: 420px;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-height: 780px) {
  .login-wrap {
    padding-top: 24px;
  }
}

/* 뒤로가기 */
.back-btn {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
}
.back-btn:hover { color: white; }

/* 캐릭터 */
.char-area {
  width: 100px;
  height: 112px;
  margin-bottom: 20px;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25));
}

.floating {
  animation: float 2s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

/* 타이틀 */
.title-area {
  text-align: center;
  margin-bottom: 28px;
}
.app-title {
  font-family: 'Nunito', 'Arial Rounded MT Bold', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0 0 8px;
}
.app-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  margin: 0;
}

/* 진행도 바 */
.progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: white;
  border-radius: 99px;
  transition: width 0.4s ease;
}
.progress-label {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
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
  padding: 16px 16px 16px 0;
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
.glow-fade-leave-active { transition: opacity 0.2s ease; }
.glow-fade-enter-from,
.glow-fade-leave-to     { opacity: 0; }

/* 가입 버튼 */
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
.login-btn:active { transform: scale(0.97); }
.login-btn:hover  { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }

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
</style>
