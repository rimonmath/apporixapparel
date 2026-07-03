<script setup lang="ts">
import { useHomeHeader } from '@/composables/useHomeHeader';
import { replaceSpaces } from '@/utils/functions';

const { pagesMachine } = useHomeHeader();

const emit = defineEmits(['needToHide']);
</script>

<template>
  <div class="home-link">
    <SmartLink
      v-for="page in pagesMachine.response.value"
      :to="`/pages/${page.id}/${replaceSpaces(page.name)}`"
      @click="emit('needToHide')"
    >
      {{ page.name }}
    </SmartLink>
  </div>
</template>

<style>
.home-link a,
.home-link .a {
  display: inline-block;
  padding: 4px 8px;
  margin: 2px 5px;
  /* font-weight: bold; */
  cursor: pointer;
}

.hn__nav--sm a,
.hn__nav--sm .a {
  display: block;
  padding: 12px 5px;
}

.hn__nav a.router-link-exact-active {
  color: var(--primary-600);
}

.hn__nav a.inline-flex,
.hn__nav .a.inline-flex {
  display: inline-flex;
}

@media only screen and (max-width: 600px) {
  .hn__nav a,
  .hn__nav .a {
    margin: 2px 2px;
  }

  .hn__nav a.hidden {
    display: none;
  }
}
</style>
