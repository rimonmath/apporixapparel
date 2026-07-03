<script setup lang="ts">
import ProductCard from '@/components/cards/ProductCard.vue';
import HomeCarousel from '@/components/segments/HomeCarousel.vue';
import { useHomeHeader } from '@/composables/useHomeHeader';
import { useRead } from '@/composables/useRead';
import { replaceDashes, replaceSpaces } from '@/utils/functions';
import type { Category, Product } from '@/utils/types';
import { NBreadcrumb, NBreadcrumbItem, NCard, NEmpty, NSkeleton } from 'naive-ui';
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { categoriesMap } = useHomeHeader();

const ProductsMachine = useRead<Product[]>(
  '/public/categories/' + route.params.categoryId + '/products'
);

onMounted(async () => {
  await ProductsMachine.start();
  document.title = categoryName.value + ' | Khudroshop';
});

const categoryName = computed(() => {
  let cn = replaceDashes(route.params.categoryName.toString() || '');

  if (!ProductsMachine.response.value?.length) {
    return cn;
  }

  ProductsMachine.response.value[0]?.categories.forEach((category) => {
    if (category.categoryId === Number(route.params.categoryId)) {
      cn = category.category.name;
    }
  });

  return cn;
});

watch(
  () => route.params.categoryId,
  async (newValue) => {
    await ProductsMachine.start('/public/categories/' + newValue + '/products');
    document.title = categoryName.value + ' | Khudroshop';
  }
);

function getParents(categoriesMap: Record<number, Category>, categoryId: number): Category[] {
  const parents: Category[] = [];

  let current = categoriesMap[categoryId];

  // Safety check
  if (!current) return parents;

  while (current.parentId) {
    const parent = categoriesMap[current.parentId];
    if (!parent) break; // stop if missing parent
    parents.push(parent);
    current = parent; // move upward
  }

  return parents;
}

const reversedCategories = computed(() => {
  return getParents(categoriesMap.value, Number(route.params.categoryId)).reverse();
});
</script>

<template>
  <div class="categories-page">
    <div class="py-4 min-h-[100vh] pb-20">
      <div class="container">
        <NCard size="small">
          <NBreadcrumb separator=">">
            <NBreadcrumbItem>
              <SmartLink to="/">Home</SmartLink>
            </NBreadcrumbItem>
            <NBreadcrumbItem v-for="category in reversedCategories">
              <SmartLink :to="`/categories/${category.id}/${replaceSpaces(category.name)}`">
                {{ category.name }}
              </SmartLink>
            </NBreadcrumbItem>

            <NBreadcrumbItem>
              {{ categoryName }}
            </NBreadcrumbItem>
          </NBreadcrumb>
        </NCard>
      </div>

      <NEmpty
        class="mt-10"
        description="Nothing found!"
        v-if="!ProductsMachine.loading.value && !ProductsMachine.response.value?.length"
      >
      </NEmpty>

      <div class="container" v-else>
        <!-- {{ getParents(categoriesMap, Number(route.params.categoryId)) }}

        <h4 class="mt-4 mb-4 text-xl">
          All <span class="text-blue-500"> {{ categoryName }} </span> Products
        </h4> -->
        <!-- {{ FeaturedProductsMachine.response }} -->
        <NSkeleton v-if="ProductsMachine.loading?.value" text :repeat="4" />
        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-8 gap-y-12 mt-8">
          <ProductCard :product="product" v-for="product in ProductsMachine.response.value">
          </ProductCard>

          <!-- <ProductCard :product="product" v-for="product in ProductsMachine.response.value">
          </ProductCard>

          <ProductCard :product="product" v-for="product in ProductsMachine.response.value">
          </ProductCard>

          <ProductCard :product="product" v-for="product in ProductsMachine.response.value">
          </ProductCard> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
