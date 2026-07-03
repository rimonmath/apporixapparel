<script setup lang="ts">
import { useStoreInfo } from '@/composables/useStoreInfo';
import { useUpdate } from '@/composables/useUpdate';
import { beautifyError } from '@/utils/functions';
import type { SuccessResponse } from '@/utils/types';
import { CartOutline } from '@vicons/ionicons5';
import { NCard, NIcon, useMessage } from 'naive-ui';
import { shallowRef, watch } from 'vue';

const { storeInfoMachine, subDomain } = useStoreInfo();
const primaryColor = shallowRef(storeInfoMachine.response.value?.brandColor || '#000000');
const layout = shallowRef(storeInfoMachine.response.value?.layout || 'layout1');
const SaveAppearenceMachine = useUpdate<SuccessResponse>(true);

const message = useMessage();

const saveChanged = async () => {
  await SaveAppearenceMachine.start(`/store/${subDomain.value}/settings/appearance`, {
    brandColor: primaryColor.value,
    layout: layout.value
  });

  if (SaveAppearenceMachine.error.value) {
    message.error(beautifyError(SaveAppearenceMachine.error.value));
  }

  message.success(SaveAppearenceMachine.response.value?.message || '');
};

watch(primaryColor, () => {
  document.body.style.setProperty('--primary-color', primaryColor.value);
});
</script>

<template>
  <div class="appearence mt-5 px-4" :style="{ '--primary-color': primaryColor }">
    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
      <div>
        <h4 class="mb-2">Appearance Settings</h4>

        <NCard>
          <strong>Select Layout</strong>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <div class="l1">
              <div class="l1__header"></div>
              <div class="l1__carousel"></div>
              <div class="l1__content"></div>
              <div class="l1__footer"></div>
            </div>

            <div class="l2">
              <div class="l2__header"></div>
              <div class="l2__content">
                <div class="l2__left"></div>
                <div class="l2__right"></div>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <strong>Select Brand Color</strong>
            {{ primaryColor }}
            <div>
              <label>
                <input
                  v-model="primaryColor"
                  type="color"
                  style="visibility: hidden; font-size: 1px; height: 2px"
                />
                <div
                  class="color-preview w-full h-10"
                  :style="{ backgroundColor: primaryColor }"
                ></div>
              </label>
            </div>
          </div>
        </NCard>
        <div class="mt-2">
          <NButton type="primary" block @click="saveChanged">Save Changes</NButton>
        </div>
      </div>

      <div>
        <h4 class="mb-2 text-center">Storefront Preview</h4>

        <div class="layout1">
          <div class="l1__header"></div>
          <div class="l1__carousel">
            <div class="l1__container grid grid-cols-1 md:grid-cols-[1fr__3fr] gap-5">
              <div class="l1__top-categories bg-white rounded-md shadow-sm overflow-hidden h-full">
                <div class="px-2 py-1 border-b border-gray-500 l1__top-categories-header"></div>
              </div>
              <div class="l1__carousel-content"></div>
            </div>
          </div>
          <div class="l1__content">
            <div class="open-cart">
              <div class="text-xs text-center">2</div>
              <div style="font-size: 12px">
                <NIcon>
                  <CartOutline />
                </NIcon>
              </div>
            </div>
            <div class="l1__container">
              <h6 class="my-3" style="font-size: 11px">Top Selling Products</h6>
              <div class="grid grid-cols-4 gap-4 gap-y-6">
                <div
                  v-for="i in 8"
                  class="l1__product-card m-2 md:m-0 product-card bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
                ></div>
              </div>

              <h6 class="mt-6 mb-3" style="font-size: 11px">Recent Products</h6>
              <div class="grid grid-cols-4 gap-4 gap-y-6">
                <div
                  v-for="i in 8"
                  class="l1__product-card m-2 md:m-0 product-card bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
                ></div>
              </div>
            </div>
          </div>
          <div class="l1__footer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: oklch(60% 0.18 220);
}

:root,
.appearence {
  --primary-5: oklch(from var(--primary-color) 99% 0.015 h);
  --primary-10: oklch(from var(--primary-color) 97% 0.025 h);

  --primary-50: oklch(from var(--primary-color) 95% 0.04 h);
  --primary-100: oklch(from var(--primary-color) 90% 0.06 h);
  --primary-200: oklch(from var(--primary-color) 80% 0.1 h);
  --primary-300: oklch(from var(--primary-color) 70% 0.14 h);
  --primary-400: oklch(from var(--primary-color) 65% 0.16 h);

  --primary-500: var(--primary-color);

  --primary-600: oklch(from var(--primary-color) 55% 0.16 h);
  --primary-700: oklch(from var(--primary-color) 45% 0.14 h);
  --primary-800: oklch(from var(--primary-color) 35% 0.12 h);
  --primary-900: oklch(from var(--primary-color) 25% 0.1 h);
}

.layout1 {
  max-width: 544px;
  margin-left: auto;
  margin-right: auto;
}

.l1__header {
  background-color: #f2f2f2;
  min-height: 6px;
  margin: 2px;
}

.layout1 .l1__header {
  background-color: #fff;
  border-bottom: 1px solid rgb(230, 230, 230);
  min-height: 30px;
  margin: 0;
}

.l1__carousel {
  background-color: #f2f2f2;
  min-height: 12px;
  margin: 2px;
}

.layout1 .l1__carousel {
  background-color: #fff;
  min-height: 120px;
  background: linear-gradient(
    149deg,
    var(--primary-500) 0%,
    var(--primary-50) 25%,
    var(--primary-5) 100%
  );
  margin: 0;
}

.l1__content {
  background-color: #f2f2f2;
  min-height: 18px;
  margin: 2px;

  position: relative;
}

.layout1 .l1__content {
  background-color: var(--primary-5);
  min-height: 180px;
  margin: 0;
}

.l1__footer {
  background-color: #f2f2f2;
  min-height: 9px;
  margin: 2px;
}

.layout1 .l1__footer {
  background-color: #414141;
  min-height: 20px;
}

.l2__header {
  background-color: #f2f2f2;
  min-height: 6px;
  margin-bottom: 2px;
}

.l2__content {
  display: flex;
  gap: 2px;
  min-height: 44px;
}

.l2__left {
  width: 20%;
  background-color: #f2f2f2;
}

.l2__right {
  width: 0;
  flex: 1;
  background-color: #f2f2f2;
}

.l1__container {
  padding: 11px 33px;
}

.l1__top-categories {
  min-height: 120px;
}

.l1__carousel-content {
  background-color: #ffffff;
  min-height: 135px;
}

.l1__product-card {
  min-height: 120px;
  cursor: pointer;
}

.l1__top-categories-header {
  background-color: var(--primary-500);
  min-height: 18px;
}

.layout1 .open-cart {
  background-color: var(--primary-500);
  padding: 1px 4px;
  border-radius: 5px 0 0 5px;
  position: absolute;
  top: 100px;
  right: 0;
  color: #fff;
  font-size: 8px;
  cursor: pointer;
}
</style>
