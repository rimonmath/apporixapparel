<script setup>
import { useHost } from '@/composables/useHost';
import DashboardLayout from '@/layouts/Dashboard.vue';

const { isKhudroshopHost } = useHost();
</script>

<template>
  <DashboardLayout v-if="isKhudroshopHost">
    <template #default>
      <RouterView></RouterView>
    </template>
  </DashboardLayout>

  <div v-else>404</div>
</template>
