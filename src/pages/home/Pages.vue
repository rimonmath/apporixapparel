<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import type { Page } from '@/utils/types';
import { NSkeleton } from 'naive-ui';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

const pageDetailsMachine = useRead<Page>('/public/pages/' + route.params.pageId);

onMounted(async () => {
  await pageDetailsMachine.start();
  document.title = pageDetailsMachine.response.value?.title || 'Khudroshop';
});

watch(
  () => route.params.pageId,
  async (newValue) => {
    await pageDetailsMachine.start('/public/pages/' + newValue);
    document.title = pageDetailsMachine.response.value?.title || 'Khudroshop';
  }
);
</script>

<template>
  <div class="container min-h-[80vh] pt-10">
    <NSkeleton v-if="pageDetailsMachine.loading?.value" text :repeat="4" />

    <div v-else class="mb-10">
      <h1>{{ pageDetailsMachine.response.value?.title }}</h1>
      <div class="mt-4 rich-text" v-html="pageDetailsMachine.response.value?.description"></div>
    </div>
  </div>
</template>
