<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useSsoConfirm } from '@/composables/useSsoConfirm';
import { NSpace } from 'naive-ui';

const { requester, approve, cancel } = useSsoConfirm();

const accessToken = localStorage.getItem('accessToken');

// function approve() {
//   const accessToken = localStorage.getItem('accessToken');

//   // Send token back to the opener window
//   window.opener.postMessage(
//     { accessToken },
//     'http://demo.localhost:5123' // target website
//   );

//   window.close();
// }

// function cancel() {
//   window.close();
// }

const router = useRouter();

onMounted(() => {
  if (!accessToken) {
    router.push('/auth/signin?redirect=/sso');
  }
});
</script>

<template>
  <div class="p-5 text-center" v-if="requester">
    <h3>
      You are signing in to <br />
      {{ requester }}
    </h3>

    <p v-if="requester" class="mt-2">
      <strong>{{ requester }}</strong> is also hosted in Khudroshop secured host. This website will
      be able to access your basic information only. Review our

      <a
        class="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
        href="https://khudroshop.com/terms.html"
        target="_blank"
      >
        Terms of Service
      </a>
      and
      <a
        class="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
        href="https://khudroshop.com/privacy.html"
        target="_blank"
      >
        Privacy Policy
      </a>

      to understand how Khudroshop will process and protect your data.
    </p>
    <p v-else>Checking requesting site...</p>

    <div class="flex justify-center mt-5">
      <NSpace>
        <NButton @click="cancel" type="default">Cancel</NButton>
        <NButton @click="approve" type="primary">Continue</NButton>
      </NSpace>
    </div>
  </div>
</template>
