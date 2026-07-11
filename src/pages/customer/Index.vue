<script setup>
import { useHost } from '@/composables/useHost';
import CustomerLayout from '@/layouts/Customer.vue';
</script>

<template>
  <CustomerLayout>
    <template #default>
      <RouterView></RouterView>
    </template>
  </CustomerLayout>
</template>
