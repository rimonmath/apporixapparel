<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { useSsoSignin } from '@/composables/useSsoSignin';
import { beautifyError } from '@/utils/functions.js';
import { signinSchema } from '@/utils/schemas.js';
import type { SigninResponse } from '@/utils/types';
import { NInput, NButton, NFormItem, NModal, useMessage } from 'naive-ui';
import { shallowReactive, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const form = shallowReactive({
  email: '',
  password: ''
});

const resetPasswordForm = shallowReactive({
  email: ''
});

const signinMachine = useCreate<SigninResponse>('/auth/signin');

async function handleSubmit() {
  //router.push('/dashboard')

  //return
  await signinMachine.start(form);

  if (signinMachine.error.value) {
    if (signinMachine.error.value.redirect) {
      router.push(signinMachine.error.value.redirect);
    }

    message.error(beautifyError(signinMachine.error.value));
    return;
  }

  message.success(signinMachine.response.value!.message);

  localStorage.setItem('accessToken', signinMachine.response.value!.accessToken);
  localStorage.setItem('customerToken', signinMachine.response.value!.customerToken);
  // localStorage.setItem('refreshToken', signinResponse.value!.refreshToken);

  if (route.query.redirect) {
    router.push(route.query.redirect as string);
    return;
  } else if (signinMachine.response.value!.redirect) {
    router.push(signinMachine.response.value!.redirect);
  }
}

const signupUrl = route.query.redirect
  ? `/auth/signup?redirect=${route.query.redirect}`
  : '/auth/signup';

const { openPopup } = useSsoSignin();
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="text-center">
        <img src="/img/logo.png" class="inline-block max-h-[50px]" alt="" />

        <h2 class="text-lg mt-4">User sign in</h2>
      </div>
      <AForm @successSubmit="handleSubmit" :formData="form" :schema="signinSchema">
        <template #default="{ errors }">
          <AFormInput
            :formData="form"
            :errors="errors"
            name="email"
            label="Email"
            placeholder="Enter Email"
          >
          </AFormInput>
          <AFormInput
            type="password"
            :formData="form"
            :errors="errors"
            name="password"
            label="Password"
            placeholder="Enter your password"
            show-password-on="click"
          >
          </AFormInput>

          <div class="mt-2">
            <NButton
              type="primary"
              attr-type="submit"
              class="login-btn"
              :loading="signinMachine.loading.value"
              block
            >
              Sign in
            </NButton>
          </div>
        </template>
      </AForm>

      <p class="mt-4 text-center">
        Don't have an account?
        <SmartLink :to="signupUrl"> Sign up </SmartLink>
      </p>

      <p class="mt-2 text-center">
        <SmartLink to="/" class="back-home">← Back to Home</SmartLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background: var(--primary-500);
  background: linear-gradient(
    171deg,
    var(--primary-500) 0%,
    rgba(225, 252, 246, 1) 80%,
    rgba(255, 255, 255, 1) 100%
  );
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
}
</style>
