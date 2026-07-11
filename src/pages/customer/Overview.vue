<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import PricingCard from '@/components/segments/PricingCard.vue';
import StatCard from '@/components/segments/StatCard.vue';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { useRead } from '@/composables/useRead';
import { useStoreInfo } from '@/composables/useStoreInfo';
import type { Package } from '@/utils/types';
import {
  CaretDownOutline,
  ChevronForwardCircleOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5';
import { NAlert, NCollapseTransition, NIcon, NModal, NTable } from 'naive-ui';
import { nextTick, onMounted, ref, shallowRef } from 'vue';

const { getProileMacine } = useDashboardHeader();

onMounted(() => {});
</script>

<template>
  <div class="overview pb-10">
    <h2 class="mt-4">Welcome back</h2>

    <p class="mt-4">
      {{ getProileMacine.response.value?.name }}
    </p>

    <!-- <hr class="my-5" /> -->

    <!-- <h4>Usage Statistics</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-5">
      <StatCard title="My Orders" :quota="50" :used="25" />
      <StatCard title="Referral Points" :quota="50" :used="48" />
      <StatCard title="Account Credits" :quota="25" :used="10" />
      <StatCard title="Apps" :quota="20" :used="10" />
    </div> -->
  </div>
</template>

<style scoped>
.overview {
  width: 95%;
  /* max-width: 800px; */
  margin: 0 auto;
  /* background-color: turquoise; */
}
</style>
