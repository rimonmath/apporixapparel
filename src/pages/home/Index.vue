<script setup>
import HomeLayout from '@/layouts/Home.vue';
import KhudroLayout from '@/layouts/Khudro.vue';
// import ANavbar from '@/components/sections/ANavbar.vue'
// import Profile from '@/components/sections/Profile.vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const isHome = computed(() => route.path === '/');
</script>

<template>
  <HomeLayout :sidebar-minimised="!isHome">
    <template #left> left </template>

    <template #top> navbar </template>

    <template #right>
      <!-- <transition name="fade" mode="out-in">
        <RouterView></RouterView>
      </transition> -->
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
  </HomeLayout>
</template>
