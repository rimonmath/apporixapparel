<script lang="ts" setup>
import { computed } from 'vue';
import TheRating from '../misc/TheRating.vue';
import { API_DOMAIN } from '@/utils/data';

interface Product {
  title: string;
  images: any[];
  pricing: any[];
}

interface Props {
  product: any;
}

const props = withDefaults(defineProps<Props>(), {});

const imageUrl = computed(() => {
  if (!props.product?.images.length) {
    return '/img/product-image.png';
  }

  return API_DOMAIN + props.product.images[0].url;
});

const pricing = computed(() => {
  if (!props.product || !props.product?.pricings?.length) {
    return {
      regularPrice: 0,
      salePrice: 0
    };
  }

  if (props.product.pricings.length > 1) {
    const p = {
      regularPrice: Infinity,
      salePrice: Infinity
    };

    for (let index = 1; index < props.product.pricings.length; index++) {
      const currentPrice = props.product.pricings[index];

      if (Number(currentPrice.salePrice) < p.salePrice && currentPrice.salePrice != 0) {
        p.salePrice = currentPrice.salePrice;
        p.regularPrice = currentPrice.regularPrice;
      }
    }

    return p;
  }
});
</script>

<template>
  <div class="product-card">
    <div class="pc__thumbnail">
      <img :src="imageUrl" alt="" />
    </div>
    <div class="pc__details px-2">
      <h2 class="text-lg mt-2">
        {{ product?.title }}
      </h2>

      <TheRating> </TheRating>

      <div class="flex items-center justify-between py-2">
        <div class="text-lg text-[#E43215]">
          Tk. {{ pricing?.salePrice === Infinity ? 'N/A' : pricing?.salePrice || 'N/A' }}
        </div>
        <div class="text-sm text-gray-500 line-through ml-3">
          Tk. {{ pricing?.regularPrice === Infinity ? 'N/A' : pricing?.regularPrice || 'N/A' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.product-card {
  cursor: pointer;
  border: 1px solid transparent;
  /* box-shadow: 0 0 3px 2px #000; */
  border-radius: 11px 11px 0 0;
}

.product-card:hover {
  border: 1px solid #e6e6e6;
  box-shadow: 0 0 6px 2px #c3c3c3;
}

.pc__thumbnail {
  /* min-height: 222px; */
  background-color: #e6e6e6;
  border-radius: 11px 11px 0 0;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pc__thumbnail img {
  border-radius: 11px 11px 0 0;
  height: 200px;
  width: auto;
}
</style>
