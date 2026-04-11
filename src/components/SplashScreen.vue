<template>
  <div class="splash">
    <div class="logo-row">
      <span ref="tRef" class="t-letter">T</span>
      <span class="im-text">im</span>
      <div
        ref="pigRef"
        class="pig-slot"
        :class="{ catchable: canCatch && !isCaught, caught: isCaught }"
        @pointerdown="onPigPointerDown"
      >
        <PigIcon />
      </div>
    </div>

    <p class="tagline" :class="{ visible: done }">당신의 소비를 똑똑하게</p>

    <!-- 잡혔을 때 힌트 -->
    <transition name="hint-fade">
      <p v-if="isCaught" class="hint">놓아줘야 시작돼요!</p>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PigIcon from '@/components/PigIcon.vue'

const emit = defineEmits(['finish'])

const pigRef = ref(null)
const tRef   = ref(null)
const done   = ref(false)
const isCaught = ref(false)
const canCatch = ref(false)

// 현재 돼지 위치를 JS에서 추적 (잡을 때 사용)
let px = 0, py = 0, psx = 1, psy = 1

let rafId        = null
let wiggleRafId  = null
let finishTimer1 = null
let finishTimer2 = null

// ─── 유틸 ───────────────────────────────────────────
function applyTransform(x, y, sx, sy, rot = 0) {
  px = x; py = y; psx = sx; psy = sy
  if (!pigRef.value) return
  let t = `translate(${x}px, ${y}px) scaleX(${sx}) scaleY(${sy})`
  if (rot) t += ` rotate(${rot}deg)`
  pigRef.value.style.transform = t
}

function lerp(a, b, t) { return a + (b - a) * t }
function easeIn(t)  { return t * t }
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

// ─── T 글자 흔들기 ──────────────────────────────────
function animateT() {
  const el  = tRef.value
  const dur = 400
  const times  = [0, 0.35, 1]
  const sxVals = [1, 1.24, 1]
  const syVals = [1, 0.58, 1]
  let start = null

  function tick(ts) {
    if (!start) start = ts
    const p = Math.min((ts - start) / dur, 1)
    let idx = 0
    for (let i = 0; i < times.length - 1; i++) {
      if (p >= times[i] && p <= times[i + 1]) idx = i
    }
    const lt = (p - times[idx]) / (times[idx + 1] - times[idx])
    el.style.transform = `scaleX(${lerp(sxVals[idx], sxVals[idx + 1], lt)}) scaleY(${lerp(syVals[idx], syVals[idx + 1], lt)})`
    if (p < 1) requestAnimationFrame(tick)
    else el.style.transform = ''
  }
  requestAnimationFrame(tick)
}

// ─── 바둥바둥 애니메이션 ────────────────────────────
function startWiggle() {
  cancelAnimationFrame(wiggleRafId)
  const catchX = px, catchY = py
  let startTime = null

  function wiggle(ts) {
    if (!isCaught.value) return
    if (!startTime) startTime = ts
    const t = (ts - startTime) / 1000

    // 빠른 회전 + 위치 떨림 + 찌그러짐
    const rot = Math.sin(t * 14) * 14
    const x   = catchX + Math.sin(t * 11) * 6 + Math.cos(t * 17) * 3
    const y   = catchY + Math.cos(t * 9)  * 5 + Math.sin(t * 13) * 2
    const sx  = 1 + Math.sin(t * 18) * 0.12
    const sy  = 1 + Math.cos(t * 18) * 0.12

    applyTransform(x, y, sx, sy, rot)
    wiggleRafId = requestAnimationFrame(wiggle)
  }
  wiggleRafId = requestAnimationFrame(wiggle)
}

function stopWiggle() {
  cancelAnimationFrame(wiggleRafId)
  wiggleRafId = null
}

// ─── 제자리로 돌아가기 ──────────────────────────────
function returnToRest(onComplete) {
  const fromX = px, fromY = py, fromSX = psx, fromSY = psy
  const dur = 500
  let startTime = null

  function tick(ts) {
    if (!startTime) startTime = ts
    const p = Math.min((ts - startTime) / dur, 1)
    const e = easeOut(p)

    applyTransform(
      lerp(fromX, 0, e),
      lerp(fromY, 0, e),
      lerp(fromSX, 1, e),
      lerp(fromSY, 1, e),
      0
    )

    if (p < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      applyTransform(0, 0, 1, 1)
      onComplete?.()
    }
  }
  rafId = requestAnimationFrame(tick)
}

// ─── 마무리 시퀀스 ──────────────────────────────────
function doFinish() {
  canCatch.value = false
  finishTimer1 = setTimeout(() => {
    done.value = true
    finishTimer2 = setTimeout(() => emit('finish'), 800)
  }, 200)
}

function cancelFinish() {
  clearTimeout(finishTimer1)
  clearTimeout(finishTimer2)
  finishTimer1 = finishTimer2 = null
}

// ─── 잡기 / 놓기 ────────────────────────────────────
function onPigPointerDown(e) {
  if (!canCatch.value || isCaught.value) return
  e.preventDefault()
  e.stopPropagation()
  isCaught.value = true
  cancelAnimationFrame(rafId)   // 비행 중지
  cancelFinish()                // 종료 타이머 취소
  startWiggle()
}

function onPointerUp() {
  if (!isCaught.value) return
  isCaught.value = false
  stopWiggle()
  // 돼지가 자리로 돌아간 뒤 종료
  returnToRest(() => doFinish())
}

// ─── 메인 비행 애니메이션 ───────────────────────────
async function runAnim() {
  await document.fonts.ready

  const pigEl    = pigRef.value
  const splashEl = pigEl.closest('.splash')

  const splashR = splashEl.getBoundingClientRect()
  const pigR    = pigEl.getBoundingClientRect()
  const tR      = tRef.value.getBoundingClientRect()

  const pigCX = pigR.left - splashR.left + pigR.width  / 2
  const pigCY = pigR.top  - splashR.top  + pigR.height / 2

  const startX = -pigCX - pigR.width  * 0.1
  const startY = -pigCY - pigR.height * 0.1
  const tLandX = (tR.left + tR.width / 2 - splashR.left) - pigCX
  const tLandY = (tR.top  - splashR.top)  - pigR.height / 2 - pigCY
  const peakX  = tLandX * 0.25
  const peakY  = tLandY - 80

  const DURATION = 1600
  const T_HIT    = 0.40
  const T_PEAK   = 0.60
  const T_SQUASH = 0.84

  pigEl.style.opacity = '1'
  canCatch.value = true   // 이제 잡을 수 있음

  let startTime = null
  let tShook    = false

  function frame(ts) {
    if (isCaught.value) return   // 잡혔으면 일시정지

    if (!startTime) startTime = ts
    const p = Math.min((ts - startTime) / DURATION, 1)

    let x, y, sx, sy

    if (p <= T_HIT) {
      const t = p / T_HIT
      x = lerp(startX, tLandX, easeOut(t))
      y = lerp(startY, tLandY, easeIn(t))
      sx = 1; sy = 1
    } else if (p <= T_PEAK) {
      const t = (p - T_HIT) / (T_PEAK - T_HIT)
      x  = lerp(tLandX, peakX, easeOut(t))
      y  = lerp(tLandY, peakY, easeOut(t))
      sx = lerp(1.28, 0.86, easeOut(t))
      sy = lerp(0.68, 1.20, easeOut(t))
    } else if (p <= T_SQUASH) {
      const t = (p - T_PEAK) / (T_SQUASH - T_PEAK)
      x  = lerp(peakX, 0, easeIn(t))
      y  = lerp(peakY, -8, easeIn(t))
      sx = lerp(0.86, 1.22, t)
      sy = lerp(1.20, 0.74, t)
    } else {
      const t = (p - T_SQUASH) / (1 - T_SQUASH)
      x  = 0
      y  = lerp(-8, 0, easeOut(t))
      sx = lerp(1.22, 1, easeOut(t))
      sy = lerp(0.74, 1, easeOut(t))
    }

    applyTransform(x, y, sx, sy)

    if (p >= T_HIT && !tShook) { tShook = true; animateT() }

    if (p < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      applyTransform(0, 0, 1, 1)
      if (!isCaught.value) doFinish()
      // isCaught인 경우: onPointerUp에서 returnToRest → doFinish 처리
    }
  }

  rafId = requestAnimationFrame(frame)
}

onMounted(() => {
  setTimeout(runAnim, 300)
  window.addEventListener('pointerup', onPointerUp)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  cancelAnimationFrame(wiggleRafId)
  cancelFinish()
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;800&display=swap');

.splash {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #7c5cbf;
  z-index: 9999;
}

.logo-row {
  display: flex;
  align-items: flex-end;
  font-family: 'Nunito', 'Arial Rounded MT Bold', sans-serif;
  font-size: clamp(64px, 12vw, 120px);
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1;
  user-select: none;
}

.t-letter {
  display: inline-block;
  transform-origin: bottom center;
}

.im-text {
  display: inline-block;
}

.pig-slot {
  width: clamp(38px, 6.8vw, 70px);
  height: clamp(50px, 8.8vw, 90px);
  flex-shrink: 0;
  margin-bottom: clamp(4px, 0.8vw, 9px);
  transform-origin: bottom center;
  opacity: 0;
  transition: filter 0.15s;
}

.pig-slot.catchable {
  cursor: grab;
}

.pig-slot.catchable:hover {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
}

.pig-slot.caught {
  cursor: grabbing;
  filter: drop-shadow(0 0 12px rgba(255, 220, 100, 0.9));
}

.tagline {
  position: absolute;
  bottom: 30%;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Nunito', sans-serif;
  font-size: clamp(14px, 2vw, 18px);
  font-weight: 500;
  letter-spacing: 0.08em;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.tagline.visible {
  opacity: 1;
  transform: translateY(0);
}

.hint {
  position: absolute;
  bottom: 22%;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Nunito', sans-serif;
  font-size: clamp(12px, 1.8vw, 16px);
  font-weight: 600;
  letter-spacing: 0.05em;
  animation: pulse 0.8s ease-in-out infinite alternate;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.3s ease;
}
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  from { opacity: 0.6; transform: scale(1); }
  to   { opacity: 1;   transform: scale(1.04); }
}
</style>
