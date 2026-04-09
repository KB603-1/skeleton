import {defineStore, storeToRefs} from "pinia";
import {computed, ref, watch} from "vue";
import {useUserStore} from "@/stores/user.js";
import api from "@/plugin/api.js";
import {useGroupStore} from "@/stores/group.js";

export const useRecordStore = defineStore("record", () => {

    const groupStore = useGroupStore();
    const {currentGroup} = storeToRefs(groupStore);
    watch(currentGroup, (newValue, oldValue) => {
        fetchRecord();
    });

    const records = ref([]);
    const incomes = computed(() => {
        return records.value.filter((record) => {
            return record.type === "income";
        });
    });

    const expenses = computed(() => {
        return records.value.filter((record) => {
            return record.type === "expense";
        });
    });


    const categories = ref([]);
    const incomeCategories = computed(() => {
        return categories.value.filter((category) => {
            return category.type === "income";
        });
    });

    const expenseCategories = computed(() => {
        return categories.value.filter((category) => {
            return category.type === "expense";
        });
    });

    async function makeRecord(recordData) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다");
        }

        const group = currentGroup.value;

        if (group) {
            let res;

            try {
                res = await api.get(`/groupMembers?userId=${user.id}&groupId=${group.id}`);
            } catch (e) {
                throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
            if (res.data.length === 0) {
                throw new Error("해당 모임에 참여하고 있지 않습니다.");
            }
        }

        const payload = {
            ...recordData,
            userId: user.id,
            groupId: group?.id ?? null,
        };

        try {
            const res = await api.post(`/records`, payload);
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchRecord();
    }

    async function deleteRecord(recordId) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }
        const record = records.value.find((record) => {
            return record.id === recordId;
        });
        if (!record) {
            throw new Error("해당 수입/지출을 찾을 수 없습니다.");
        }

        if (record.userId !== user.id) {
            throw new Error("해당 수입/지출은 삭제할 수 없습니다.");
        }

        try {
            const res = await api.delete(`/records/${recordId}`);
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchRecord();
    }

    async function editRecord(recordId, changes) {
        const user = getLoggedInUser();
        if (!user) {
            throw new Error("로그인이 필요합니다.");
        }
        const record = records.value.find((record) => {
            return record.id === recordId;
        });
        if (!record) {
            throw new Error("해당 수입/지출을 찾을 수 없습니다.");
        }

        if (record.userId !== user.id) {
            throw new Error("해당 수입/지출은 수정할 수 없습니다.");
        }

        try {
            const res = await api.patch(`/records/${recordId}`, changes);
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        await fetchRecord();
    }

    async function fetchRecord() {
        const user = getLoggedInUser();
        if (!user) {
            records.value = [];
            return;
        }

        const group = currentGroup.value;

        if (!group) {
            try {
                const res = await api.get(`/records?userId=${user.id}&groupId=${null}&_embed=category&_embed=user`);
                records.value = res.data;
            } catch (e) {
                throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
            return;
        }

        try {
            const res = await api.get(`/records?groupId=${group.id}&_embed=category&_embed=user`);
            records.value = res.data;
        } catch (e) {
            throw new Error("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    async function fetchCategories() {
        try {
            const res = await api.get(`/categories`);
            categories.value = res.data;
        } catch (e) {

        }
    }

    function getLoggedInUser() {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return null;
        return userStore.user;
    }

    return {
        records,
        incomes,
        expenses,
        makeRecord,
        editRecord,
        deleteRecord,
        fetchRecord,
        incomeCategories,
        expenseCategories,
        fetchCategories
    };
});