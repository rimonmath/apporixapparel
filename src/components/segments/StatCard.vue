<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import type { Package } from '@/utils/types';
import { NButton } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  quota: number | string;
  used: number | string;
}>();

const percentageUsed = computed(() => {
  if (props.quota === 0) return 0;
  return Number(Math.min((Number(props.used) / Number(props.quota)) * 100, 100).toFixed(2));
});

const hue = computed(() => {
  return 120 - (percentageUsed.value * 120) / 100;
});
</script>

<template>
  <div class="bg-white shadow-sm rounded-2xl p-5 flex flex-col justify-between">
    <div>
      <div class="flex justify-between">
        <p class="text-sm text-gray-500">{{ title }}</p>
        <p class="text-sm font-medium">{{ percentageUsed }}%</p>
      </div>

      <h2 class="mt-2 text-xl font-bold text-gray-900">
        {{ used }}
        <span class="text-[15px] text-gray-500">
          / {{ quota === Infinity ? 'Unlimited' : quota }}</span
        >
      </h2>

      <div class="text-right">
        <!-- <p class="text-xs text-gray-400">vs last month</p> -->
      </div>
    </div>

    <div class="mt-4">
      <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          class="h-2 rounded-full"
          :style="{
            width: percentageUsed + '%',
            backgroundColor: `hsl(${120 - percentageUsed * 1.2}, 100%, 45%)`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>
