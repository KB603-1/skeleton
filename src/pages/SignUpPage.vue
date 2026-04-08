<script setup>
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {useUserStore} from "@/stores/user.js";
import {Alert, AlertTitle} from "@/components/ui/alert/index.js";

const store = useUserStore();
const router = useRouter();
const nickname = ref("");
const username = ref("");
const password = ref("");
const errorMessage = ref("");

const regex = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/;

async function signUp() {
  try {
    nickname.value = nickname.value.trim();
    username.value = username.value.trim();
    password.value = password.value.trim();

    if (!nickname.value) {
      throw new Error("사용할 닉네임을 입력해주세요.");
    }
    if (!username.value) {
      throw new Error("사용할 아이디를 입력해주세요.");
    }
    if (!password.value) {
      throw new Error("사용할 비밀번호를 입력해주세요.");
    }

    if (!regex.test(username.value)) {
      throw new Error("아이디는 영문 + 숫자 조합이어야 합니다.");
    }
    if (!regex.test(password.value)) {
      throw new Error("비밀번호는 영문 + 숫자 조합이어야 합니다.");
    }
    await store.register(
        {
          nickname: nickname.value,
          username: username.value,
          password: password.value
        });
    router.push("/login");
  } catch (error) {
    errorMessage.value = error.message;
  }
}

</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <Card class="w-full h-screen rounded-none sm:h-auto sm:max-w-md sm:rounded-2xl">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
      </CardHeader>
      <form @submit.prevent="signUp">
        <CardContent>
          <div class="grid w-full items-center gap-4">

            <div class="grid w-full items-center gap-1.5">
              <Label for="nickname">닉네임</Label>
              <Input v-model="nickname" id="nickname" type="text" placeholder="닉네임"/>
            </div>

            <div class="grid w-full items-center gap-1.5">
              <Label for="username">아이디</Label>
              <Input v-model="username" id="username" type="text" placeholder="아이디"/>
            </div>

            <div class="grid w-full items-center gap-1.5">
              <Label for="password">비밀번호</Label>
              <Input v-model="password" id="password" type="password" placeholder="••••••••"/>
            </div>

          </div>
          <Alert
              v-if="errorMessage"
              class="mt-4 bg-red-50 border-red-50"
          >
            <AlertTitle class="text-red-400">
              {{ errorMessage }}
            </AlertTitle>
          </Alert>
        </CardContent>

        <CardFooter class="grid w-full items-center gap-1.5 mt-4">
          <Button type="submit" class="w-full">
            회원가입
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<style scoped>

</style>