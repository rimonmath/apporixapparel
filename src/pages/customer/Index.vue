<script setup>
import { useHost } from '@/composables/useHost';
import CustomerLayout from '@/layouts/Customer.vue';

const { isKhudroshopHost } = useHost();
</script>

<template>
  <CustomerLayout v-if="!isKhudroshopHost">
    <template #default>
      <RouterView></RouterView>
    </template>
  </CustomerLayout>

  <div v-else>404</div>
</template>
