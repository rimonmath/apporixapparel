<script setup lang="ts">
import ProductCard from '@/components/cards/ProductCard.vue';
import HomeCarousel from '@/components/segments/HomeCarousel.vue';
import { useRead } from '@/composables/useRead';
import { replaceDashes, replaceSpaces } from '@/utils/functions';
import type { Product } from '@/utils/types';
import { NEmpty, NSkeleton } from 'naive-ui';
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const ProductsMachine = useRead<Product[]>('/public/products/by-keyword/' + route.params.keyword);
// const RecentProductsMachine = useRead<Product>('/public/products/recent');

watch(
  () => route.params.keyword,
  (newValue) => {
    ProductsMachine.start('/public/products/by-keyword/' + newValue);
    document.title = `All ${route.params.keyword} Products | Apporix Nexus`;
  }
);

onMounted(() => {
  ProductsMachine.start();
  // RecentProductsMachine.start();
  document.title = `All ${route.params.keyword} Products | Apporix Nexus`;
});
</script>

<template>
  <div class="landing-page">
    <div class="py-4 lp__banner1 min-h-[100vh] pb-20">
      <div class="container">
        <h4 class="mt-4 mb-4 text-xl">
          Search result for
          <span class="text-blue-500"> {{ replaceDashes(route.params.keyword as string) }} </span>
        </h4>
        <!-- {{ FeaturedProductsMachine.response }} -->
        <NSkeleton v-if="ProductsMachine.loading?.value" text :repeat="4" />

        <NEmpty
          class="mt-10"
          description="Nothing found!"
          v-if="!ProductsMachine.loading.value && !ProductsMachine.response.value?.length"
        >
        </NEmpty>

        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-8 gap-y-12 mt-8">
          <ProductCard :product="product" v-for="product in ProductsMachine.response.value">
          </ProductCard>
        </div>

        <!-- <hr class="my-10" />

        <h4 class="mt-10 mb-4 text-xl">Recent Products</h4>
        <NSkeleton v-if="RecentProductsMachine.loading?.value" text :repeat="4" />
        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-y-12 mt-8">
          <ProductCard :product="product" v-for="product in RecentProductsMachine.response.value">
          </ProductCard>
        </div> -->
      </div>
    </div>
  </div>
</template>
