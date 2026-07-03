<script lang="ts" setup>
import { StarHalfOutline, StarOutline } from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
</script>

<template>
  <div class="flex justify-between">
    <div class="flex items-center">
      <NIcon style="color: yellow">
        <StarOutline></StarOutline>
      </NIcon>
      <NIcon>
        <StarOutline></StarOutline>
      </NIcon>

      <NIcon>
        <StarOutline></StarOutline>
      </NIcon>

      <NIcon>
        <StarOutline></StarOutline>
      </NIcon>
      <NIcon>
        <StarHalfOutline />
      </NIcon>
      <div class="ml-1">(4.5)</div>
    </div>
    <div>1123 Ratings</div>
  </div>
</template>
