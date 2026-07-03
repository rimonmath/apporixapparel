<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { useHost } from '@/composables/useHost';
import { beautifyError } from '@/utils/functions.js';
import { signupSchema } from '@/utils/schemas.js';
import type { SuccessResponse } from '@/utils/types';
import { NInput, NButton, NFormItem, NModal, useMessage } from 'naive-ui';
import { onMounted, shallowReactive, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { isKhudroshopHost } = useHost();

const message = useMessage();

const router = useRouter();
const route = useRoute();

const refCode = (route.query.refCode as string) || '';

const form = shallowReactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  refCode: (route.query.refCode as string) || ''
});

const resetPasswordForm = shallowReactive({
  email: ''
});

const signupMachine = useCreate<SuccessResponse & { redirect: string }>('/auth/signup');

async function handleSubmit() {
  //router.push('/dashboard')

  //return
  await signupMachine.start(form);

  if (signupMachine.error.value) {
    if (signupMachine.error.value.redirect) {
      router.push(signupMachine.error.value.redirect);
    }

    message.error(beautifyError(signupMachine.error.value));
    return;
  }

  message.success(signupMachine.response.value!.message);

  if (route.query.redirect) {
    router.push(('/auth/signin?redirect=' + route.query.redirect) as string);
    return;
  } else if (signupMachine.response.value!.redirect) {
    router.push(signupMachine.response.value!.redirect);
  }
}

onMounted(() => {
  if (!isKhudroshopHost) {
    router.push('/auth/signin');
  }
});
</script>

<template>
  <div class="login-container" v-if="isKhudroshopHost">
    <div class="login-box">
      <div class="text-center mb-2">
        <img src="/img/logo.png" class="inline-block max-h-[50px]" alt="" />

        <h2 class="text-lg mt-2">New user sign up</h2>
      </div>
      <AForm @successSubmit="handleSubmit" :formData="form" :schema="signupSchema">
        <template #default="{ errors }">
          <AFormInput name="email" label="Email" placeholder="Enter Email"> </AFormInput>

          <AFormInput name="name" label="Full Name" placeholder="Enter Full Name"> </AFormInput>

          <AFormInput
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            show-password-on="click"
          >
          </AFormInput>

          <AFormInput
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Enter your confirm password"
            show-password-on="click"
          >
          </AFormInput>

          <AFormInput
            name="refCode"
            label="Referral Code"
            placeholder="Enter Referral Code"
            disabled
            v-if="refCode"
          >
          </AFormInput>

          <div class="mt-2">
            <NButton
              type="primary"
              attr-type="submit"
              class="login-btn"
              :loading="signupMachine.loading.value"
              block
            >
              Sign Up
            </NButton>
          </div>
        </template>
      </AForm>

      <p class="mt-4 text-center">
        Already have an account?
        <SmartLink to="/auth/signin"> Sign in </SmartLink>
      </p>

      <p class="mt-2 text-center">
        <SmartLink to="/" class="back-home">← Back to Home</SmartLink>
      </p>

      <!-- <a href="#" class="back-home">← Back to Home</a> -->
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
  padding: 20px;
  overflow-y: auto;
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 450px;
  max-width: 98%;
}

@media (max-width: 768px) {
  .login-container {
    height: auto;
  }
}
</style>
