<script lang="ts" setup>
import { computed } from 'vue';
import TheRating from '../misc/TheRating.vue';
import { API_DOMAIN } from '@/utils/data';
import { RouterLink } from 'vue-router';
import { cropText, getUploadedUrl, replaceSpaces } from '@/utils/functions';
import SmartLink from '../others/SmartLink.vue';
import OnViewport from '../others/OnViewport.vue';

interface Product {
  title: string;
  images: any[];
  description?: string;
  startingPrice: string;
  unit: string;
}

interface Props {
  product: any;
}

const props = withDefaults(defineProps<Props>(), {});

const imageUrl = computed(() => {
  if (!props.product?.images.length) {
    return '/img/product-image.png';
  }

  return getUploadedUrl(props.product.images[0].url);
});

const pricing = computed(() => {
  if (!props.product || !props.product?.pricings?.length) {
    return {
      regularPrice: 0,
      salePrice: 0
    };
  }

  if (props.product.pricings.length === 1) {
    return {
      regularPrice: props.product.pricings[0].regularPrice,
      salePrice: props.product.pricings[0].salePrice
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
  <SmartLink
    :to="`/products/${product.id}/${replaceSpaces(product.title)}`"
    class="m-3 md:m-0 product-card bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
  >
    <div class="pc__thumbnail px-2 py-4">
      <OnViewport direction="up" :distance="20">
        <img :src="imageUrl" alt="" />
      </OnViewport>
    </div>
    <div class="pc__details p-4">
      <div class="text-md mt-2 md:min-h-[55px]">
        {{ cropText(product?.title, 50) }}
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="text-lg color-primary-500">Tk. {{ pricing?.salePrice }}</div>
        <div class="text-sm text-gray-500 ml-3 line-through">Tk. {{ pricing?.regularPrice }}</div>
      </div>
    </div>
  </SmartLink>
</template>

<style>
.product-card {
  cursor: pointer;
}

.pc__thumbnail {
  /* min-height: 222px; */
  /* background-color: #e6e6e6; */
  border-radius: 11px 11px 0 0;

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pc__details {
  background-color: #f6f3f469;
}

.pc__thumbnail img {
  border-radius: 11px 11px 0 0;
  height: 200px;
  width: auto;
}
</style>
