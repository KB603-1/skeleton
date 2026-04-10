import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.js';
import api from '@/plugin/api.js';

export const useGroupStore = defineStore('group', () => {
  const userStore = useUserStore();
  const { user, isLoggedIn } = storeToRefs(userStore);

  watch(isLoggedIn, (newValue, oldValue) => {
    fetchGroup();
  });

  const currentGroup = ref();
  const myGroups = ref([]);
  watch(myGroups, (newGroups) => {
    if (!currentGroup.value) {
      currentGroup.value = null;
      return;
    }
    const group = newGroups.find((g) => g.id === currentGroup.value.id);
    currentGroup.value = group || null;
  });

  // ===================================================== 임시 =====================================================
  // 현재 선택된 그룹이 바뀔 때마다 해당 그룹의 멤버 목록을 서버에서 가져옵니다.
  watch(currentGroup, async (newGroup) => {
    if (!newGroup) return;
    try {
      // json-server 버전 호환성(v1+) 이슈를 방지하기 위해
      // 멤버 연결 데이터와 전체 유저 데이터를 각각 가져와서 프론트엔드에서 안전하게 조립합니다.
      const [membersRes, usersRes] = await Promise.all([
        api.get(`/groupMembers?groupId=${newGroup.id}`),
        api.get(`/users`),
      ]);

      newGroup.members = membersRes.data.map((gm) => {
        // usersRes에서 해당 멤버의 유저 상세 정보를 찾아 끼워 넣습니다.
        const memberUser = usersRes.data.find((u) => u.id === gm.userId) || {};
        return {
          id: memberUser.id || gm.userId,
          nickname: memberUser.nickname || '알 수 없음',
          icon: memberUser.icon || '👤',
          role:
            (memberUser.id || gm.userId) === newGroup.ownerId
              ? 'owner'
              : 'member',
        };
      });
    } catch (e) {
      console.error('멤버 정보를 불러오는 중 오류가 발생했습니다.', e);
    }
  });
  // ===================================================== 임시 =====================================================

  // 그룹 조회
  async function fetchGroup() {
    const user = getLoggedInUser();
    if (!user) {
      myGroups.value = [];
      return;
    }
    try {
      const res = await api.get(`/groupMembers?userId=${user.id}&_embed=group`);
      myGroups.value = res.data.map((groupMember) => {
        const group = groupMember.group;
        return {
          id: group.id,
          name: group.name,
          password: group.password,
          isOwner: group.userId === user.id,
          ownerId: group.userId, // 방장 식별을 위해 추가
          members: [], // 멤버 목록 초기화 (반응형 상태 보장)
        };
      });
    } catch (e) {}
  }

  // 현재 그룹 변경
  function changeCurrentGroup(groupId) {
    if (groupId == null) {
      currentGroup.value = null; // 개인 가계부
      return;
    }

    const group = myGroups.value.find((group) => {
      return group.id === groupId;
    });

    if (!group) {
      currentGroup.value = null;
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    currentGroup.value = group;
  }

  // 그룹 생성
  async function makeGroup(groupData) {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const payload = {
      ...groupData,
      userId: user.id,
    };

    try {
      const res = await api.post('/groups', payload);
      const group = res.data;

      try {
        await api.post('/groupMembers', {
          userId: user.id,
          groupId: group.id,
        });
      } catch (e) {
        // 롤백
        await api.delete(`/groups/${group.id}`);
        throw e;
      }
    } catch (e) {
      console.error(e);
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    await fetchGroup();
  }

  // 그룹 삭제
  async function deleteGroup(groupId) {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const group = myGroups.value.find((group) => group.id === groupId);
    if (!group) throw new Error('해당 그룹을 찾을 수 없습니다.');
    if (!group.isOwner)
      throw new Error('그룹의 관리자만 그룹을 삭제할 수 있습니다.');

    try {
      const res = await api.delete(
        `/groups/${groupId}?_dependent=groupMembers&_dependent=records`,
      );
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    await fetchGroup();
  }

  // 초대링크 생성
  function generateInviteLink(inviteData) {
    const group = myGroups.value.find((group) => {
      return group.id === inviteData.groupId;
    });
    if (!group) throw new Error('해당 그룹에 참여하고 있지 않습니다.');
    if (!group.isOwner)
      throw new Error('그룹의 관리자만 초대 링크를 만들 수 있습니다.');
    return `${window.location.origin}/invite?groupId=${group.id}&password=${group.password}`;
  }

  // 그룹 참가
  async function joinGroup(joinData) {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    let isAlreadyJoined = true;
    try {
      const res = await api.get(
        `/groupMembers?userId=${user.id}&groupId=${joinData.groupId}`,
      );
      isAlreadyJoined = res.data.length !== 0;
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    if (isAlreadyJoined) {
      throw new Error('이미 가입한 그룹입니다.');
    }

    let group;
    try {
      const res = await api.get(`/groups/${joinData.groupId}`);
      group = res.data;
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    if (group.password !== joinData.password) {
      throw new Error('잘못된 초대입니다.');
    }
    try {
      await api.post(`/groupMembers`, {
        groupId: group.id,
        userId: user.id,
      });
    } catch (e) {
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    await fetchGroup();
  }

  // 그룹 탈퇴
  async function leaveGroup(groupId) {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const group = myGroups.value.find((group) => {
      return group.id === groupId;
    });

    if (!group) {
      throw new Error('해당 그룹에 참여하고 있지 않습니다.');
    }

    if (group.isOwner) {
      throw new Error('그룹의 관리자는 그룹을 나갈 수 없습니다.');
    }

    try {
      const res = await api.get(
        `/groupMembers?userId=${user.id}&groupId=${groupId}`,
      );
      if (res.data.length === 0) {
        throw new Error();
      }
      for (const gm of res.data) {
        await api.delete(`/groupMembers/${gm.id}`);
      }
    } catch (e) {
      console.error(e);
      throw new Error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    await fetchGroup();
  }

  // 멤버 강퇴 (방장이 멤버 내보내기)
  async function removeMember(groupId, memberId) {
    const user = getLoggedInUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 그룹 체크
    const group = myGroups.value.find((group) => group.id === groupId);
    if (!group) throw new Error('해당 그룹을 찾을 수 없습니다.');
    // 방장이 아닐 때 에러처리
    if (!group.isOwner) {
      throw new Error('방장만 멤버를 내보낼 수 있습니다.');
    }
    // 자기 자신일 때 에러처리(일단 해놓음)
    if (group.ownerId === memberId) {
      throw new Error('방장 자신을 내보낼 수 없습니다.');
    }

    try {
      // groupMembers 테이블에서 찾기
      const res = await api.get(
        `/groupMembers?groupId=${groupId}&userId=${memberId}`,
      );
      const member = res.data[0];

      // 멤버 null 처리
      if (!member) {
        throw new Error('해당 멤버가 그룹에 존재하지 않습니다.');
      }

      // groupMembers 테이블에서 삭제 처리
      await api.delete(`/groupMembers/${member.id}`);

      // 현재 그룹의 멤버 목록에서 제거, 즉각 반영 시키기
      if (currentGroup.value && currentGroup.value.id === groupId) {
        currentGroup.value.members = currentGroup.value.members.filter(
          (m) => m.id !== memberId,
        );
      }
    } catch (e) {
      throw new Error(
        e.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  // ====== 헬퍼 함수 ======
  function getLoggedInUser() {
    if (!isLoggedIn.value) return null;
    return user.value;
  }

  return {
    myGroups,
    currentGroup,
    fetchGroup,
    changeCurrentGroup,
    makeGroup,
    deleteGroup,
    generateInviteLink,
    joinGroup,
    leaveGroup,
    removeMember,
  };
});
