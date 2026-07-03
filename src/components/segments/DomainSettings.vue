<script lang="ts" setup>
import { useStoreInfo } from '@/composables/useStoreInfo';
import { LogoWhatsapp } from '@vicons/ionicons5';
import { NIcon, NModal } from 'naive-ui';
import { computed, shallowRef } from 'vue';

const { storeInfoMachine, subDomain } = useStoreInfo();

const storeURL = computed(() =>
  import.meta.env.VITE_API_DOMAIN === 'http://localhost:3123'
    ? `http://${subDomain.value}.localhost:5123`
    : `https://${subDomain.value}.khudroshop.com`
);

const customDomainDialog = shallowRef(false);
</script>

<template>
  <div class="block md:flex items-center gap-2">
    <div class="store__search">
      <a
        :href="storeURL"
        target="_blank"
        rel="noopener noreferrer"
        class="cursor-pointer hover:underline text-blue-500"
      >
        {{ `https://${subDomain}.khudroshop.com` }}
      </a>

      {{ storeInfoMachine.error }}
    </div>

    <div class="mt-5 md:mt-0">
      <NButton size="small" @click="customDomainDialog = true"> Add Custom Domain </NButton>
    </div>

    <div class="mt-5 md:mt-0">({{ storeInfoMachine.response.value?.status }})</div>

    <div class="mt-5 md:mt-0" v-if="storeInfoMachine.response.value?.status === 'Draft'">
      <NButton size="small" @click="customDomainDialog = true"> Publish Now </NButton>
    </div>

    <NModal
      v-model:show="customDomainDialog"
      class="custom-card"
      preset="card"
      title="Contact Admin"
      :bordered="false"
      :style="{ width: '600px' }"
    >
      <p>Contact Admin to add custom domain or publish your store</p>
      <p>
        Send a message in
        <a
          href="https://wa.me/8801723702957"
          class="ml-2 text-green-600 inline-flex items-center gap-1"
        >
          <NIcon>
            <LogoWhatsapp></LogoWhatsapp>
          </NIcon>
          Whatsapp
        </a>
      </p>
    </NModal>
  </div>
</template>
