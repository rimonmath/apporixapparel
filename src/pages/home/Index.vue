<script setup>
import HomeLayout from '@/layouts/Home.vue';
import KhudroLayout from '@/layouts/Khudro.vue';
// import ANavbar from '@/components/sections/ANavbar.vue'
// import Profile from '@/components/sections/Profile.vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const isHome = computed(() => route.path === '/');

const isKhudroShopDomain = computed(() => {
  const origin = window.location.origin;

  // console.log(origin);

  return (
    origin === 'https://khudroshop.com' ||
    origin === 'http://localhost:5123' ||
    origin === 'http://localhost:3123'
  );
});
</script>

<template>
  <!-- <div v-if="isKhudroShopDomain" class="p-20 text-center">
    <h1 class="my-4">Khudroshop.com</h1>
    <SmartLink to="/dashboard"> Go To Dashboard</SmartLink>
  </div> -->

  <KhudroLayout v-if="isKhudroShopDomain"> </KhudroLayout>

  <HomeLayout v-else :sidebar-minimised="!isHome">
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
