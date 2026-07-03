<script lang="ts" setup>
import PricingCard from '@/components/segments/PricingCard.vue';
import { useRead } from '@/composables/useRead';
import type { Package } from '@/utils/types';
import { LogoWhatsapp } from '@vicons/ionicons5';
import { NAlert, NIcon } from 'naive-ui';
import { onMounted } from 'vue';

const getPackagesMacine = useRead<Package[]>('/public/packages');

onMounted(() => {
  getPackagesMacine.start();
});
</script>

<template>
  <div class="bg-white">
    <div class="container">
      <h1 class="pt-16 text-center">Khudroshop Pricing</h1>
      <!-- {{ getPackagesMacine.response.value[0] }} -->

      <h4 class="text-center my-4">Start Free, then publish the store with one of the packages</h4>

      <div class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 gap-8">
        <PricingCard
          v-for="packageDetails in getPackagesMacine.response.value"
          :key="packageDetails.id"
          :packageDetails="packageDetails"
          hideGetStartedButton
        />
      </div>

      <div class="mt-5 mx-5 mb-10">
        <NAlert title="Dedicated Plan" type="info">
          <p class="my-5">
            If you want to setup a completely dedicated store in your own hosting with custom
            features and integrations, please contact us at
            <a
              target="_blank"
              :href="`https://wa.me/+8801723702957`"
              class="text-blue-600 hover:underline flex items-center gap-1"
            >
              <NIcon>
                <LogoWhatsapp />
              </NIcon>
              Whatsapp
            </a>
          </p>
        </NAlert>
      </div>
    </div>
  </div>
</template>
