<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { darkTheme, lightTheme, NMessageProvider, NModalProvider } from 'naive-ui';
import { NConfigProvider } from 'naive-ui';
</script>

<template>
  <NConfigProvider :theme="lightTheme">
    <NModalProvider>
      <NMessageProvider placement="bottom">
        <router-view v-slot="{ Component }">
          <transition name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </NMessageProvider>
    </NModalProvider>
  </NConfigProvider>

  <!-- <div class="fixed top-0 left-0 w-full h-1 z-[9999] animate-loader"></div> -->
  <!-- <transition name="fade" mode="out-in">
    <RouterView />
  </transition> -->
</template>

<style scoped>
@keyframes loader {
  0% {
    width: 0%;
    left: 0%;
  }
  50% {
    width: 50%;
    left: 25%;
  }
  100% {
    width: 0%;
    left: 100%;
  }
}

.animate-loader {
  animation: loader 1.5s ease-in-out infinite;
  display: none;
  background-color: var(--primary-500);
}

.lazy-loading .animate-loader {
  display: block;
}
</style>
