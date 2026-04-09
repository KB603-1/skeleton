<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useGroupStore } from '@/stores/group.js';
import { useRecordStore } from '@/stores/record.js';
import { useUserStore } from '@/stores/user.js';

import GroupHeader from '@/components/group/GroupHeader.vue';
import TabExpenses from '@/components/group/TabExpenses.vue';
import TabMembers from '@/components/group/TabMembers.vue';
import TabPlay from '@/components/group/TabPlay.vue';

const router = useRouter();

// 스토어
const groupStore = useGroupStore();
const recordStore = useRecordStore();
const userStore = useUserStore();

// 반응형 유지를 위해 storeToRefs 사용
const { currentGroup } = storeToRefs(groupStore);
const { expenses } = storeToRefs(recordStore);
const { user } = storeToRefs(userStore);

// --- 상태 관리 ---
const activeTab = ref('expenses'); // 'expenses', 'members', 'play'
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);

// 1. 그룹 이름
const groupName = computed(() => currentGroup.value?.name || '로딩 중...');

// 2. 그룹 멤버 리스트 (결제 금액 합산 + 기본 아이콘 추가)
const members = computed(() => {
  const baseMembers = currentGroup.value?.members || [];

  return baseMembers.map((member) => {
    // 1) 이 멤버가 이번 달에 결제한 내역만 필터링
    const memberExpenses = currentMonthExpenses.value.filter(
      (record) => record.userId === member.id,
    );

    // 2) 그 내역들의 총합(amount) 계산
    const totalSpent = memberExpenses.reduce(
      (sum, record) => sum + (record.amount || 0),
      0,
    );

    // 3) 기존 멤버 정보에 amount와 icon을 끼워 넣어서 반환!
    return {
      ...member,
      amount: totalSpent, // <--- 에러의 원인이었던 amount를 여기서 만들어줍니다!
      icon: member.icon || '👤', // DB에 아이콘이 없으면 기본 이모지 표시
    };
  });
});
const currentMonthExpenses = computed(() => {
  return expenses.value.filter((record) => {
    // record.date는 "2026-04-01" 같은 형태입니다.
    if (!record.date) return false;

    // 날짜 문자열을 잘라서 연도와 월을 추출합니다.
    const [year, month] = record.date.split('-');

    // 현재 화면에서 선택한 연/월(currentYear, currentMonth)과 일치하는 것만 반환!
    return (
      parseInt(year) === currentYear.value &&
      parseInt(month) === currentMonth.value
    );
  });
});

// 4. 총 지출액, 1인당 평균액 계산
const totalInfo = computed(() => {
  if (currentMonthExpenses.value.length === 0) {
    return { totalAmount: 0, perPersonAmount: 0 };
  }

  // 지출 내역 합산 (DB 스키마에 amount가 있다고 가정)
  const total = currentMonthExpenses.value.reduce(
    (sum, record) => sum + (record.amount || 0),
    0,
  );

  // 멤버 수로 나누기 (멤버가 0명이면 0원)
  const memberCount = members.value.length || 1;
  const perPerson = Math.floor(total / memberCount);

  return { totalAmount: total, perPersonAmount: perPerson };
});

// 5. '내가' 결제한 총 금액 계산 (내 id와 지출내역의 userId 비교)
const myTotalSpent = computed(() => {
  if (!user.value) return 0;

  return currentMonthExpenses.value
    .filter((record) => record.userId === user.value.id)
    .reduce((sum, record) => sum + (record.amount || 0), 0);
});

// ==========================================
// 🕹️ 핸들러 함수들
// ==========================================

// 월 변경 시 (현재는 UI만 바뀌고 서버 요청은 나중에 구현)
const changeMonth = (delta) => {
  let newMonth = currentMonth.value + delta;
  let newYear = currentYear.value;

  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }

  currentYear.value = newYear;
  currentMonth.value = newMonth;

  // TODO: 나중에 이 부분에 fetchRecord()에 year, month 파라미터를 넘겨서
  // 해당 월의 데이터만 가져오도록 record.js를 수정할 수 있습니다.
};

// 메인 화면으로 돌아가기 (currentGroup을 비우고 홈으로)
const handleClose = () => {
  groupStore.changeCurrentGroup(null);
  router.push('/');
};

// 지출 내역 삭제
const handleDeleteExpense = async (recordId) => {
  if (confirm('정말로 이 지출 내역을 삭제하시겠습니까?')) {
    try {
      await recordStore.deleteRecord(recordId);
      alert('삭제되었습니다.');
    } catch (e) {
      alert(e.message);
    }
  }
};

// 초대 링크 복사
const copyInviteLink = () => {
  if (!currentGroup.value) return;
  try {
    const link = groupStore.generateInviteLink({
      groupId: currentGroup.value.id,
    });
    navigator.clipboard.writeText(link);
    alert('초대 링크가 클립보드에 복사되었습니다!\n' + link);
  } catch (e) {
    alert(e.message);
  }
};

// 멤버 강퇴
const removeMember = async (nickname) => {
  alert(`[개발 중] ${nickname}님을 내보내는 기능은 아직 준비 중입니다.`);
};

// ==========================================
// 🚀 생명주기 훅
// ==========================================
onMounted(() => {
  if (!user.value) {
    userStore.user = {
      id: 'user001',
      nickname: '김철수',
    };
  }
  //   // 만약 그룹이 선택되지 않은 상태로 이 페이지에 들어왔다면 메인으로 튕겨냄
  //   if (!currentGroup.value) {
  //     alert('선택된 그룹이 없습니다. 메인 화면으로 이동합니다.');
  //     router.push('/');
  //   }
  if (!currentGroup.value) {
    console.warn("⚠️ 테스트 모드: 강제로 '가족 가계부' 그룹을 세팅합니다.");
    groupStore.currentGroup = {
      id: 'grp001',
      name: '가족 가계부',
      password: 'group123',
      isOwner: true,
      members: [
        { id: 'user001', nickname: '김철수', icon: '👨' },
        { id: 'user002', nickname: '이영희', icon: '👩' },
      ],
    };
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#f4f3ff] flex flex-col">
    <GroupHeader
      :groupName="groupName"
      :currentYear="currentYear"
      :currentMonth="currentMonth"
      :totalInfo="totalInfo"
      :members="members"
      v-model:activeTab="activeTab"
      @changeMonth="changeMonth"
      @close="handleClose"
    />

    <main class="flex-1 px-5 py-6">
      <TabExpenses
        v-show="activeTab === 'expenses'"
        :expenses="currentMonthExpenses"
        @deleteExpense="handleDeleteExpense"
      />
      <TabMembers
        v-show="activeTab === 'members'"
        :members="members"
        @copyLink="copyInviteLink"
        @removeMember="removeMember"
      />
      <TabPlay v-show="activeTab === 'play'" :members="members" />
    </main>
  </div>
</template>
