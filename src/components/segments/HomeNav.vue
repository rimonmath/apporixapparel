<script setup lang="ts">
import { useHomeHeader } from '@/composables/useHomeHeader';
import { replaceSpaces } from '@/utils/functions';
import type { Category } from '@/utils/types';
import {
  CaretForwardOutline,
  ChevronDownOutline,
  Home,
  RadioButtonOffOutline
} from '@vicons/ionicons5';
import { NCollapse, NCollapseItem, NIcon, NPopover } from 'naive-ui';
import { shallowRef } from 'vue';

const { categories } = useHomeHeader();

const emit = defineEmits(['needToHide']);
const categoryDropdown = shallowRef(true);

function hideCategoryDropdown() {
  console.log('Hiding...');
  categoryDropdown.value = false;
  emit('needToHide');
  setTimeout(() => {
    categoryDropdown.value = true;
  }, 1);
}
</script>

<template>
  <div class="home-nav">
    <SmartLink :to="`/`" class="category-item flex items-center hover:text-blue-100">
      <NIcon>
        <Home />
      </NIcon>
      Home
    </SmartLink>
    <template v-for="category in categories">
      <NPopover
        v-if="category.childs?.length && categoryDropdown"
        :overlap="false"
        placement="bottom-start"
        class="cat-pop"
      >
        <template #trigger>
          <div class="a inline-block inline-flex items-center root-cat">
            <span class="mr-2"> {{ category.name }} </span>
            <NIcon class="transform00" :class="{ 'rrrotate-180': !categoryDropdown }">
              <ChevronDownOutline></ChevronDownOutline>
            </NIcon>
          </div>
        </template>

        <div class="min-w-[300px] p-5 all-categories">
          <NCollapse display-directive="show">
            <template #arrow>
              <NIcon>
                <CaretForwardOutline />
              </NIcon>
            </template>
            <template v-for="childCategory in category.childs">
              <NCollapseItem
                :title="childCategory.name"
                :name="childCategory.name"
                v-if="childCategory.childs?.length"
              >
                <template v-for="childChildCategory in childCategory.childs">
                  <NCollapse v-if="childChildCategory.childs?.length">
                    <template #arrow>
                      <NIcon>
                        <CaretForwardOutline />
                      </NIcon>
                    </template>
                    <NCollapseItem :title="childChildCategory.name" :name="childChildCategory.name">
                      <SmartLink
                        v-for="childChildChildCategory in childChildCategory.childs"
                        :to="`/categories/${childChildChildCategory.id}/${replaceSpaces(childChildChildCategory.name)}`"
                        class="category-item flex items-center hover:text-blue-100"
                        @click="hideCategoryDropdown"
                      >
                        <div class="pl-9">
                          {{ childChildChildCategory.name }}
                        </div>
                      </SmartLink>
                    </NCollapseItem>
                  </NCollapse>

                  <SmartLink
                    v-else
                    :to="`/categories/${childChildCategory.id}/${replaceSpaces(childChildCategory.name)}`"
                    class="category-item flex items-center hover:text-blue-100"
                    @click="hideCategoryDropdown"
                  >
                    <div class="pl-9">
                      {{ childChildCategory.name }}
                    </div>
                  </SmartLink>
                </template>
              </NCollapseItem>

              <div v-else>
                <hr class="my-2" />
                <SmartLink
                  :to="`/categories/${childCategory.id}/${replaceSpaces(childCategory.name)}`"
                  class="category-item flex items-center hover:text-blue-100"
                  @click="hideCategoryDropdown"
                >
                  <div class="pl-0 md:pl-2">
                    {{ childCategory.name }}
                  </div>
                </SmartLink>
              </div>
            </template>
          </NCollapse>
        </div>
      </NPopover>

      <SmartLink
        v-else
        :to="`/categories/${category.id}/${replaceSpaces(category.name)}`"
        class="category-item flex items-center hover:text-blue-100"
        @click="hideCategoryDropdown"
      >
        <div class="pl-0 md:pl-2">
          {{ category.name }}
        </div>
      </SmartLink>
    </template>
  </div>
</template>

<style>
.home-nav {
  /* background-color: var(--primary-600); */
}

.home-nav a,
.home-nav .a {
  display: inline-block;
  padding: 4px 8px;
  margin: 2px 5px;
  font-weight: bold;
  cursor: pointer;
}

.hn__nav--sm a,
.hn__nav--sm .a {
  display: block;
  padding: 12px 5px;
}

.hn__nav a.router-link-exact-active {
  color: var(--primary-600);
}

.categories {
  width: 98%;
  max-width: 960px;
}

.category-item a:hover {
  text-decoration: underline;
}

.hn__nav a.inline-flex,
.hn__nav .a.inline-flex {
  display: inline-flex;
}

@media only screen and (max-width: 600px) {
  .hn__nav a,
  .hn__nav .a {
    margin: 2px 2px;
  }

  .hn__nav a.hidden {
    display: none;
  }
}

.root-cat:hover {
  color: var(--primary-200);
}

.cat-pop:hover .root-cat {
  color: var(--primary-200) !important;
}
</style>
