<script setup>
import KhudroHeader from '@/components/segments/KhudroHeader.vue';
import KhudroFooter from '@/components/segments/KhudroFooter.vue';
import { useCart } from '@/composables/useCart';
import { RouterView, useRoute } from 'vue-router';
import KhudroLanding from '@/pages/home/khudro/Landing.vue';
import OnViewport from '@/components/others/OnViewport.vue';

const route = useRoute();

const allowedPaths = [
  '/pricing',
  '/doc',
  '/about',
  '/funding',
  '/signup',
  '/signin',
  '/privacy',
  '/terms'
];

const { totalCartItems, totalCartPrice, direction, cartOpened, addingToCart } = useCart();
</script>
<template>
  <div class="khudro-layout">
    <div class="kl__top">
      <KhudroHeader></KhudroHeader>
    </div>
    <div class="kl__bottom">
      <!-- <RouterView></RouterView> -->
      <div class="kl__content min-h-[90vh]">
        <RouterView v-if="allowedPaths.includes(route.path)"></RouterView>
        <KhudroLanding v-else></KhudroLanding>
      </div>
      <!-- <OnViewport direction="up" :distance="60" :duration="800"> -->
      <KhudroFooter />
      <!-- </OnViewport> -->
    </div>
  </div>
</template>

<style>
.khudro-layout {
  /* display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column; */
}

.kl__top {
  min-height: 55px;
  background-color: #f5f5f5; /* Light gray background */
  border-bottom: 1px solid #e0e0e0; /* Subtle bottom border */
  /* display: flex;
  justify-content: space-between;
  padding: 9px 22px;
  align-items: center; */
}

.kl__bottom {
  /* height: 0;
  flex: 1; */
  /* background-color: #ffffff; */
  overflow-y: auto;
}

.kl__footer {
  background-color: #353535;
  color: #fff;
  padding: 9px;
}

.kl__logo {
  font-size: 20px;
  font-weight: bold;
  color: #007c3e;
}

@media only screen and (max-width: 700px) {
  .kl__top {
    display: block;
  }
}
</style>
