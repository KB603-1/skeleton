import {defineStore, storeToRefs} from "pinia";
import {ref, watch} from "vue";
import {useUserStore} from "@/stores/user.js";
import api from "@/plugin/api.js";

export const useGroupStore = defineStore("group", () => {

    const userStore = useUserStore();
    const {user, isLoggedIn} = storeToRefs(userStore);

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
        const group = newGroups.find(g => g.id === currentGroup.value.id);
        currentGroup.value = group || null;
    });

    async function fetchGroup() {
        const user = getLoggedInUser();
        if (!user) {
            myGroups.value = [];
            return;
        }
        try {
            const res = await api.get(`/groupMembers?userId=${user.id}&_embed=group`);
            myGroups.value = res.data.map(groupMember => {
                const group = groupMember.group;
                return {
                    id: group.id,
                    name: group.name,
                    password: group.password,
                    isOwner: group.userId === user.id,
                };
            });
        } catch (e) {
        }
    }

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
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        currentGroup.value = group;
    }

    async function makeGroup(groupData) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }

        const payload = {
            ...groupData,
            userId: user.id,
        };

        try {
            const res = await api.post("/groups", payload);
            const group = res.data;

            try {
                await api.post("/groupMembers", {
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
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchGroup();
    }

    async function deleteGroup(groupId) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }

        const group = myGroups.value.find((group) => group.id === groupId);
        if (!group) throw new Error("해당 그룹을 찾을 수 없습니다.");
        if (!group.isOwner) throw new Error("그룹의 관리자만 그룹을 삭제할 수 있습니다.");

        try {
            const res = await api.delete(`/groups/${groupId}?_dependent=groupMembers&_dependent=records`);
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchGroup();
    }

    function generateInviteLink(inviteData) {
        const group = myGroups.value.find(group => {
            return group.id === inviteData.groupId;
        });
        if (!group) throw new Error("해당 그룹에 참여하고 있지 않습니다.");
        if (!group.isOwner) throw new Error("그룹의 관리자만 초대 링크를 만들 수 있습니다.");
        return `${import.meta.env.BASE_URL}/invite?groupId=${group.id}&password=${group.password}`;
    }

    async function joinGroup(joinData) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }

        let isAlreadyJoined = true;
        try {
            const res =
                await api.get(`/groupMembers?userId=${user.id}&groupId=${joinData.groupId}`);
            isAlreadyJoined = res.data.length !== 0;
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }

        if (isAlreadyJoined) {
            throw new Error("이미 가입한 그룹입니다.");
        }

        let group;
        try {
            const res = await api.get(`/groups/${joinData.groupId}`);
            group = res.data;
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        if (group.password !== joinData.password) {
            throw new Error("잘못된 초대입니다.");
        }
        try {
            await api.post(`/groupMembers`, {
                groupId: group.id,
                userId: user.id,
            });
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchGroup();
    }

    async function leaveGroup(groupId) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }

        const group = myGroups.value.find((group) => {
            return group.id === groupId;
        });

        if (!group) {
            throw new Error("해당 그룹에 참여하고 있지 않습니다.");
        }

        if (group.isOwner) {
            throw new Error("그룹의 관리자는 그룹을 나갈 수 없습니다.");
        }

        try {
            const res =
                await api.get(`/groupMembers?userId=${user.id}&groupId=${groupId}`);
            if (res.data.length === 0) {
                throw new Error();
            }
            for (const gm of res.data) {
                await api.delete(`/groupMembers/${gm.id}`);
            }
        } catch (e) {
            console.error(e);
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchGroup();
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
    };
});