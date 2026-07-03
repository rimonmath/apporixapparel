<script setup lang="ts">
import ProductCard from '@/components/cards/ProductCard.vue';
import OnViewport from '@/components/others/OnViewport.vue';
import HomeCarousel from '@/components/segments/HomeCarousel.vue';
import { useHomeHeader } from '@/composables/useHomeHeader';
import { useRead } from '@/composables/useRead';
import { replaceSpaces } from '@/utils/functions';
import type { Carousel, Product } from '@/utils/types';
import { onMounted } from 'vue';

const { categoriesMachine, topCategories } = useHomeHeader();
const TopProductsMachine = useRead<Product>('/public/products/top');
const RecentProductsMachine = useRead<Product>('/public/products/recent');
const CarouselsMachine = useRead<Carousel[]>('/public/carousels');

onMounted(async () => {
  TopProductsMachine.start();
  categoriesMachine.start();
  CarouselsMachine.start();
  RecentProductsMachine.start();
});
</script>

<template>
  <div class="landing-page">
    <div class="py-2 lp__banner">
      <div class="container py-2">
        <div class="grid grid-cols-1 md:grid-cols-[1fr__3fr] gap-5">
          <!-- Beautify look and feel of top categories with  tailwind css -->
          <OnViewport direction="left">
            <div class="bg-white rounded-md shadow-sm overflow-hidden h-full">
              <div class="px-4 py-2 border-b border-gray-500 top-categories-header">
                <div class="font-bold text-center text-white">Top Categories</div>
              </div>

              <div class="text-center py-2">
                <SmartLink
                  v-for="category in topCategories"
                  :key="category.id"
                  :to="`/categories/${category.id}/${replaceSpaces(category.name)}`"
                  class="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-all duration-200 border-l-2 border-transparent hover:border-primary-500"
                >
                  <span
                    class="text-sm font-medium text-gray-600 group-hover:text-gray-900 group-hover:translate-x-1 transition-all"
                  >
                    {{ category.name }}
                  </span>
                </SmartLink>
              </div>
            </div>
          </OnViewport>

          <OnViewport direction="right">
            <div>
              <HomeCarousel :items="CarouselsMachine.response.value || []"></HomeCarousel>
            </div>
          </OnViewport>
        </div>
      </div>
    </div>

    <div class="py-10" style="border-top: 1px solid #e0e0e0">
      <div class="container">
        <h4 class="mb-4">Top Selling Products</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
          <ProductCard :product="product" v-for="product in TopProductsMachine.response.value">
          </ProductCard>
        </div>
      </div>
    </div>

    <div class="py-4">
      <div class="container">
        <h4 class="mt-4 mb-6 text-xl">Recent Products</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
          <ProductCard :product="product" v-for="product in RecentProductsMachine.response.value">
          </ProductCard>
        </div>
        <br />
        <br />
        <br />
      </div>
    </div>
  </div>
</template>

<style>
.lp__banner {
  background: linear-gradient(
    149deg,
    var(--primary-500) 0%,
    var(--primary-50) 25%,
    var(--primary-5) 100%
  );
}
.lp__banner1 {
  --start-color: #f9f9f9;
  /* background-image: url('/img/bgs/banner-bg.jpg'); */
  /* background-size: 100% auto; */
  background-image: linear-gradient(to right, #fff, var(--start-color), #fff);
}

.top-categories-header {
  background-color: var(--primary-500);
}
</style>
