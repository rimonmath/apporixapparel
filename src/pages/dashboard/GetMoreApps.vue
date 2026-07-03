<script setup lang="ts">
import { LogoWhatsapp } from '@vicons/ionicons5';
import { NCard, NIcon } from 'naive-ui';
</script>

<template>
  <div class="container mt-4">
    <NCard>
      <h4>Get More Apps</h4>
      <p class="my-2">Need a custom app? We can help you with that!</p>

      <p>
        Contact us with your requirements at
        <a href="https://wa.me/8801723702957" class="text-green-600 inline-flex items-center gap-1">
          <NIcon>
            <LogoWhatsapp></LogoWhatsapp>
          </NIcon>
          Whatsapp
        </a>
      </p>
    </NCard>
  </div>
</template>
