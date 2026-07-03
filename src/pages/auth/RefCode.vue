<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const refCode = route.params.refCode;

router.push(`/auth/signup?refCode=${refCode}`);
</script>

<template>
  <div></div>
</template>
