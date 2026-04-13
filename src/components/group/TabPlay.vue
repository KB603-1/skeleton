<script setup>
import { ref, computed, nextTick } from 'vue';
import PigIcon from '@/components/PigIcon.vue';

const props = defineProps({
  members: { type: Array, required: true },
});

// 랭킹 계산 로직 (props.members 기반)
const rankings = computed(() => {
  const sorted = [...props.members].sort((a, b) => b.amount - a.amount);
  if (sorted.length < 2) return [];
  return [
    {
      title: '이번 달 결제왕 👑',
      desc: '가장 지갑을 많이 연 대인배',
      user: sorted[0],
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
    },
    {
      title: '이번 달 짠돌이 🪙',
      desc: '가장 돈을 적게 쓴 절약왕',
      user: sorted[sorted.length - 1],
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ];
});

// 룰렛 로직
const isSpinning = ref(false);
const isScratching = ref(false);
const isRevealed = ref(false);
const rouletteWinner = ref(null);
const currentSpinItem = ref({ icon: '🎯', nickname: '누가 걸릴까?' });

const scratchCanvas = ref(null);
let ctx = null;
let isDrawing = false;
let scratchCount = 0;

const initCanvas = async () => {
  await nextTick();
  const canvas = scratchCanvas.value;
  if (!canvas) return;

  // getBoundingClientRect()는 CSS 애니메이션(zoom-in) 중에는 축소된 값을 반환하므로,
  // 변형되지 않은 실제 레이아웃 크기인 offsetWidth/offsetHeight를 사용합니다.
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  // 고해상도(Retina) 디스플레이 대응
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 복권 은색 배경
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, width, height);

  // 안내 문구
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✨ 긁어주세요! ✨', width / 2, height / 2);

  // 긁어내는 브러시(지우개) 설정
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 40;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};

const getPointerPos = (e) => {
  const canvas = scratchCanvas.value;
  const rect = canvas.getBoundingClientRect();
  let clientX = e.clientX;
  let clientY = e.clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  // 화면에 표시된 크기(rect)와 캔버스의 고유 레이아웃 크기의 비율을 곱해주어 포인터 위치를 정확히 보정합니다.
  const scaleX = canvas.offsetWidth / (rect.width || 1);
  const scaleY = canvas.offsetHeight / (rect.height || 1);

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
};

const startScratch = (e) => {
  if (!isScratching.value) return;
  isDrawing = true;
  const pos = getPointerPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  scratch(e);
};

const endScratch = () => {
  isDrawing = false;
  ctx?.beginPath();
};

const scratch = (e) => {
  if (!isDrawing || !isScratching.value) return;
  const pos = getPointerPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  scratchCount++;

  // 성능 최적화를 위해 마우스 움직임 5번당 1번씩만 긁힌 비율 계산
  if (scratchCount % 5 === 0) {
    const canvas = scratchCanvas.value;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    const totalPixels = pixels.length / 4;

    // RGBA 픽셀 데이터에서 알파 채널(투명도, i+3) 검사
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparentPixels++;
    }

    const scratchedPercent = (transparentPixels / totalPixels) * 100;
    // 긁힌 면적이 60% 이상이면 결과 완전히 공개
    if (scratchedPercent >= 60) {
      isScratching.value = false;
      isRevealed.value = true;
    }
  }
};

const spinRoulette = () => {
  if (isSpinning.value || isScratching.value || props.members.length === 0)
    return;
  isSpinning.value = true;
  isRevealed.value = false;
  rouletteWinner.value = null;

  let elapsed = 0;
  let intervalTime = 40;
  const totalDuration = 3000;

  const spin = () => {
    const randomMember =
      props.members[Math.floor(Math.random() * props.members.length)];
    currentSpinItem.value = {
      icon: randomMember.icon,
      nickname: randomMember.nickname,
    };

    elapsed += intervalTime;
    intervalTime *= 1.1;

    if (elapsed < totalDuration) {
      setTimeout(spin, intervalTime);
    } else {
      rouletteWinner.value =
        props.members[Math.floor(Math.random() * props.members.length)];
      isSpinning.value = false;
      isScratching.value = true;
      scratchCount = 0;
      initCanvas();
    }
  };
  spin();
};
</script>

<template>
  <div class="animate-in fade-in duration-300 space-y-6 pb-10">
    <div>
      <!-- <h2 class="text-lg font-bold text-slate-800 mb-3 ml-1">🏆 명예의 전당</h2>
      <div
        v-if="rankings.length === 0"
        class="text-center text-slate-400 py-6 bg-white rounded-2xl"
      >
        데이터가 부족하여 랭킹을 산정할 수 없습니다.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(rank, idx) in rankings"
          :key="idx"
          class="rounded-2xl p-4 flex flex-col gap-1 shadow-sm"
          :class="rank.bg"
        >
          <div class="flex items-center gap-4 mb-1">
            <div
              class="text-3xl bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-sm shrink-0"
            >
              {{ rank.user.icon }}
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm mb-0.5" :class="rank.text">
                {{ rank.title }}
              </p>
              <div class="flex items-end justify-between">
                <span class="font-extrabold text-xl text-slate-900">{{
                  rank.user.nickname
                }}</span>
                <span class="font-bold text-lg text-slate-700"
                  >{{ rank.user.amount.toLocaleString() }}원</span
                >
              </div>
            </div>
          </div>
          <p class="text-xs font-medium text-slate-500 text-right">
            {{ rank.desc }}
          </p>
        </div>
      </div> -->
    </div>

    <div
      class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300"
      ></div>
      <h2 class="text-lg font-bold text-slate-800 mb-1">
        🔥 결제는 역시 몰빵이 제맛!
      </h2>
      <p class="text-sm text-slate-500 mb-8">나는 아니겠지.. 나는 아니겠지..</p>

      <div class="h-48 flex flex-col items-center justify-center mb-6">
        <!-- 1. 룰렛 돌아가는 중 (패닉 상태 돼지) -->
        <div v-if="isSpinning" class="flex flex-col items-center w-full">
          <div class="w-28 h-28 mb-3 animate-fast-bounce relative">
            <PigIcon
              variant="panic"
              eyeColor="#836BC2"
              bodyColor="#f3eeff"
              noseSpotColor="#b09ddb"
            />
          </div>
          <p class="text-xl font-bold text-slate-900 animate-pulse mt-2">
            {{ currentSpinItem.nickname }}...?
          </p>
        </div>

        <!-- 2. 긁기(스크래치) 및 결과 발표 -->
        <div
          v-else-if="isScratching || isRevealed"
          class="animate-in zoom-in duration-300 flex flex-col items-center w-full"
        >
          <!-- 긁어낼 영역 컨테이너 -->
          <div
            class="relative flex flex-col items-center w-full max-w-[220px] py-4 bg-slate-50/50 rounded-3xl border border-slate-100"
          >
            <div class="relative w-32 h-32 mb-2">
              <div
                class="w-full h-full"
                :class="{ 'animate-wiggle': isRevealed }"
              >
                <PigIcon
                  variant="happy"
                  eyeColor="#836BC2"
                  bodyColor="#f3eeff"
                  noseSpotColor="#b09ddb"
                />
              </div>
            </div>
            <p class="text-2xl font-bold text-slate-900 mt-2">
              🎉
              <span class="text-[#fcad03]">{{ rouletteWinner?.nickname }}</span>
              당첨!
            </p>

            <!-- 스크래치 캔버스 오버레이 -->
            <canvas
              v-show="isScratching"
              ref="scratchCanvas"
              class="absolute inset-0 w-full h-full z-20 rounded-3xl cursor-crosshair touch-none shadow-inner"
              @mousedown="startScratch"
              @mousemove="scratch"
              @mouseup="endScratch"
              @mouseleave="endScratch"
              @touchstart.prevent="startScratch"
              @touchmove.prevent="scratch"
              @touchend.prevent="endScratch"
            ></canvas>
          </div>
        </div>

        <!-- 3. 대기 상태 (기본 돼지) -->
        <div
          v-else
          class="flex flex-col items-center cursor-pointer group"
          @click="spinRoulette"
        >
          <div
            class="w-28 h-28 mb-3 animate-float group-hover:scale-110 transition-transform duration-300"
          >
            <PigIcon
              variant="normal"
              eyeColor="#836BC2"
              bodyColor="#f3eeff"
              noseSpotColor="#b09ddb"
            />
          </div>
        </div>
      </div>

      <button
        @click="spinRoulette"
        :disabled="isSpinning || isScratching || props.members.length === 0"
        class="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden"
      >
        <div
          v-if="isSpinning"
          class="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] animate-sweep"
        ></div>
        {{
          isSpinning
            ? '돼지가 고르는 중...'
            : isScratching
              ? '화면을 긁어보세요! ✨'
              : isRevealed
                ? '다시 한번 몰빵 가즈아! 🐷'
                : '독박 룰렛 돌리기! 🐷'
        }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
.zoom-in {
  animation: zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.winner-icon-pop {
  animation:
    popBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
    float 2s ease-in-out infinite 0.6s;
}
.animate-fast-bounce {
  animation: fast-bounce 0.3s infinite;
}
.animate-sweep {
  animation: sweep 1.5s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes fast-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1.05, 0.9);
  }
  50% {
    transform: translateY(-25px) scale(0.95, 1.05);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}
@keyframes popBounce {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes sweep {
  0% {
    transform: translateX(-150%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}
</style>
