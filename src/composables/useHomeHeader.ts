// composables/useCounter.ts
import { computed } from 'vue';
import { useRead } from './useRead';
import type { Category /*, Page */, Page, Store } from '@/utils/types';
import { getCategoryChilds } from '@/utils/functions';

const categoriesMachine = useRead<Category[]>('/public/categories');

const categories = computed(() => getCategoryChilds(categoriesMachine.response.value!, 0));

const categoriesMap = computed(() => {
  if (!categoriesMachine.response.value) {
    return {};
  }
  return Object.fromEntries(categoriesMachine.response.value?.map((c) => [c.id, c]));
});

const pagesMachine = useRead<Page[]>('/public/pages');
const storeDetailsMachine = useRead<Store>('/public/store/details');

const topCategories = computed(() => {
  return categoriesMachine.response.value?.filter((item) => item.isTop);
});

export function useHomeHeader() {
  return {
    categoriesMachine,
    categories,
    topCategories,
    pagesMachine,
    categoriesMap,
    storeDetailsMachine
  };
}
