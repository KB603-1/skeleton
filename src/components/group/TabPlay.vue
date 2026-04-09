<script setup>
import { ref, computed } from 'vue';

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
const rouletteWinner = ref(null);
const currentSpinItem = ref({ icon: '🎯', nickname: '누가 걸릴까?' });

const spinRoulette = () => {
  if (isSpinning.value || props.members.length === 0) return;
  isSpinning.value = true;
  rouletteWinner.value = null;

  let elapsed = 0;
  let intervalTime = 50;
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
    }
  };
  spin();
};
</script>

<template>
  <div class="animate-in fade-in duration-300 space-y-6 pb-10">
    <div>
      <h2 class="text-lg font-bold text-slate-800 mb-3 ml-1">🏆 명예의 전당</h2>
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
      </div>
    </div>

    <div
      class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300"
      ></div>
      <h2 class="text-lg font-bold text-slate-800 mb-1">
        🎲 이번엔 누가 쏠까?
      </h2>
      <p class="text-sm text-slate-500 mb-6">
        남은 잔돈이나 다음 결제자를 뽑아보세요!
      </p>

      <div class="h-36 flex flex-col items-center justify-center mb-6">
        <div v-if="isSpinning" class="flex flex-col items-center w-full">
          <div
            class="text-5xl mb-3 bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-slate-200 fast-spin-blur"
          >
            {{ currentSpinItem.icon }}
          </div>
          <p class="text-xl font-bold text-slate-400">
            {{ currentSpinItem.nickname }}
          </p>
        </div>
        <div
          v-else-if="rouletteWinner"
          class="animate-in zoom-in duration-300 flex flex-col items-center w-full"
        >
          <div
            class="text-6xl mb-3 bg-violet-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-violet-200 winner-bounce"
          >
            {{ rouletteWinner.icon }}
          </div>
          <p class="text-2xl font-bold text-slate-900">
            당첨!
            <span class="text-violet-600">{{ rouletteWinner.nickname }}</span>
          </p>
        </div>
        <div v-else class="text-slate-300 flex flex-col items-center">
          <div class="text-6xl mb-2">🎯</div>
          <p class="text-sm font-medium">버튼을 눌러 돌려주세요</p>
        </div>
      </div>

      <button
        @click="spinRoulette"
        :disabled="isSpinning || props.members.length === 0"
        class="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden"
      >
        <div
          v-if="isSpinning"
          class="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] animate-sweep"
        ></div>
        {{ isSpinning ? '뽑는 중...' : '랜덤 뽑기 시작!' }}
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
.fast-spin-blur {
  animation: shake 0.1s infinite alternate;
}
.winner-bounce {
  animation: popBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
@keyframes shake {
  0% {
    transform: translateY(-2px) scale(0.98);
  }
  100% {
    transform: translateY(2px) scale(1.02);
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
