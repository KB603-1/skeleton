<script setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useGroupStore } from '@/stores/group.js';
import { useRecordStore } from '@/stores/record.js';
import { useUserStore } from '@/stores/user.js';

import GroupHeader from '@/components/group/GroupHeader.vue';
import TabExpenses from '@/components/group/TabExpenses.vue';
import TabMembers from '@/components/group/TabMembers.vue';
import TabPlay from '@/components/group/TabPlay.vue';
import { useModalStore } from '@/stores/modal.js';
import EditRecordModal from '@/components/EditRecordModal.vue';

const router = useRouter();

// 스토어
const groupStore = useGroupStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const modalStore = useModalStore();

// 반응형 유지를 위해 storeToRefs 사용
const { currentGroup } = storeToRefs(groupStore);
const { records } = storeToRefs(recordStore);
const { user } = storeToRefs(userStore);

// --- 상태 관리 ---
const activeTab = ref('expenses'); // 'expenses', 'members', 'play'
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);

// 그룹 이름
const groupName = computed(() => currentGroup.value?.name || '로딩 중...');

// 그룹 멤버 리스트 (결제 금액 합산 + 기본 아이콘 추가)
const members = computed(() => {
  const baseMembers = currentGroup.value?.members || [];

  return baseMembers.map((member) => {
    // 1) 이 멤버가 이번 달에 결제한 내역만 필터링
    const memberExpenses = currentMonthRecords.value.filter(
      (record) => record.userId === member.id && record.type === 'expense',
    );

    // 2) 그 내역들의 총합(amount) 계산
    const totalSpent = memberExpenses.reduce(
      (sum, record) => sum + (record.amount || 0),
      0,
    );

    // 3) 기존 멤버 정보에 amount와 icon을 끼워 넣어서 반환
    return {
      ...member,
      amount: totalSpent, // <--- 에러의 원인이었던 amount를 여기서 만들어줍니다!
      icon: member.icon || '👤', // DB에 아이콘이 없으면 기본 이모지 표시
    };
  });
});
const currentMonthRecords = computed(() => {
  return records.value.filter((record) => {
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

// TabExpenses의 공통 TransactionItem에 맞춰 데이터 가공
const formattedRecords = computed(() => {
  return currentMonthRecords.value.map((record) => {
    // 1. 현재 모임에 있는 멤버인지 확인합니다.
    const isCurrentMember = members.value.some((m) => m.id === record.userId);

    // 2. record 객체에 포함된(_embed) 유저 정보를 사용하여 닉네임을 가져옵니다.
    let payerName = record.user?.nickname || '알 수 없는 유저';

    return {
      id: record.id,
      icon: record.category?.icon || '💸',
      title: record.title,
      category: record.category?.name || '기타',
      payerName: payerName,
      memo: record.memo,
      amount: (record.type === 'income' ? 1 : -1) * record.amount,
      isOwner: user.value && record.userId === user.value.id,
      date: record.date, // 그룹화를 위해 날짜 원본 추가
      type: record.type, // 수입/지출 토글을 위해 타입 추가
      isDeparted: !isCurrentMember, // 탈퇴한 멤버 여부(boolean) 전달
    };
  });
});

// 총 지출액, 1인당 평균액 계산
const totalInfo = computed(() => {
  const expensesOnly = currentMonthRecords.value.filter(
    (r) => r.type === 'expense',
  );
  if (expensesOnly.length === 0) {
    return { totalAmount: 0, perPersonAmount: 0 };
  }

  // 지출 내역 합산 (DB 스키마에 amount가 있다고 가정)
  const total = expensesOnly.reduce(
    (sum, record) => sum + (record.amount || 0),
    0,
  );

  // 멤버 수로 나누기 (멤버가 0명이면 0원)
  const memberCount = members.value.length || 1;
  const perPerson = Math.floor(total / memberCount);

  return { totalAmount: total, perPersonAmount: perPerson };
});

// 내가 결제한 총 금액
const myTotalSpent = computed(() => {
  if (!user.value) return 0;

  return currentMonthRecords.value
    .filter(
      (record) => record.userId === user.value.id && record.type === 'expense',
    )
    .reduce((sum, record) => sum + (record.amount || 0), 0);
});

// 월 변경 메서드
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
};

// 메인 화면으로 돌아가기 (currentGroup을 비우고 홈으로)
const handleClose = () => {
  // groupStore.changeCurrentGroup(null);
  // router.push('/');
  router.back();
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

// 지출 내역 수정 (모달 열기)
const handleEditExpense = (recordId) => {
  modalStore.openModal(EditRecordModal, { recordId });
};

// 초대 링크 복사
// ==========================================
const copyInviteLink = () => {
  if (!currentGroup.value) return;

  try {
    const link = groupStore.generateInviteLink({
      groupId: currentGroup.value.id,
    });

    // 1. 안전한 환경 (https 또는 localhost)일 때는 최신 API 사용
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => {
        alert('초대 링크가 복사되었습니다!\n\n' + link);
      });
    }
    // 2. HTTP IP 접속 (휴대폰 테스트)일 때는 우회 방식 사용
    else {
      // 투명한 입력창을 몰래 만들어서 글자를 넣고 복사하는 꼼수입니다.
      const textArea = document.createElement('textarea');
      textArea.value = link;

      // 화면에 안 보이게 저 멀리 숨김
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        // 구형 브라우저에서도 작동하는 복사 명령어
        document.execCommand('copy');
        alert('초대 링크가 복사되었습니다!\n\n' + link);
      } catch (err) {
        alert(
          '복사가 차단되었습니다. 아래 링크를 직접 선택해서 복사해주세요:\n\n' +
            link,
        );
      } finally {
        // 복사 끝나면 몰래 만든 입력창 지우기
        textArea.remove();
      }
    }
  } catch (e) {
    alert(e.message);
  }
};

// 멤버 강퇴
const removeMember = async (member) => {
  if (!currentGroup.value) return;
  if (!confirm(`${member.nickname}님을 그룹에서 내보내시겠습니까?`)) return;

  try {
    // API 통신 시에는 member 객체의 id를 사용합니다.
    await groupStore.removeMember(currentGroup.value.id, member.id);
    alert(`${member.nickname}님을 성공적으로 내보냈습니다.`);
  } catch (e) {
    alert(e.message);
  }
};

// currentGroup의 상태 변화를 감지하여 의도적으로 그룹이 해제될 때만 메인으로 이동 (새로고침 시 튕김 방지)
watch(currentGroup, (newGroup, oldGroup) => {
  if (oldGroup && !newGroup) {
    router.push('/');
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
        :expenses="formattedRecords"
        @deleteExpense="handleDeleteExpense"
        @editExpense="handleEditExpense"
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
