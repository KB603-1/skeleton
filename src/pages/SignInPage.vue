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
const username = ref("");
const password = ref("");
const errorMessage = ref("");

async function signIn() {
  try {
    await store.login({username: username.value, password: password.value});
    router.push("/");
  } catch (error) {
    errorMessage.value = error.message;
  }
}

</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <Card class="w-full h-screen rounded-none sm:h-auto sm:max-w-md sm:rounded-2xl">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <form @submit.prevent="signIn">
        <CardContent>
          <div class="grid w-full items-center gap-4">

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
            로그인
          </Button>
          <Button variant="link" @click="router.push('/signUp')">회원가입</Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<style scoped>

</style>