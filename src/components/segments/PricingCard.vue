<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import type { Package } from '@/utils/types';
import { NButton } from 'naive-ui';

const props = defineProps<{
  packageDetails: Package;
  isActive?: boolean;
  hideGetStartedButton?: boolean;
}>();

const emit = defineEmits<{
  (e: 'getStarted', value: Package): void;
}>();
</script>

<template>
  <div
    :class="[
      'bg-white rounded-2xl shadow-sm border px-4 py-6 text-center transition-all duration-300',
      isActive
        ? 'border-green-500 bg-green-50 shadow-md scale-105'
        : 'border-gray-200 hover:shadow-md hover:scale-105'
    ]"
  >
    <!-- Plan Name -->
    <h3 class="text-2xl font-semibold text-gray-800 mb-2">
      {{ packageDetails.name }}
    </h3>
    <p class="text-gray-500 m3-6 min-h-[40px]">
      {{ packageDetails.description }}
    </p>

    <!-- Price -->
    <div class="mb-6">
      <span class="text-5xl font-bold text-gray-900">
        ${{ packageDetails.monthlyChargeInUsd }}
      </span>
      <span class="text-gray-500 text-sm">/month</span>
    </div>

    <!-- Features -->
    <ul class="text-gray-600 space-y-2 mb-8 text-left">
      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        Unlimited Products
      </li>

      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        Unlimited Categories
      </li>

      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        {{ packageDetails.monthlyOrdersLimit }} Monthly Orders
      </li>

      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        {{ packageDetails.storageLimitMb }} MB Storage
      </li>

      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        Daily Customer Support
      </li>

      <li class="flex items-center gap-2">
        <CheckIcon></CheckIcon>
        Custom Domain Setup
      </li>
    </ul>

    <NButton
      v-if="!hideGetStartedButton"
      type="primary"
      :disabled="isActive"
      @click="emit('getStarted', packageDetails)"
    >
      Get Started
    </NButton>
  </div>
</template>
