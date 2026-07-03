<script setup lang="ts">
import { getUploadedUrl } from '@/utils/functions';
import type { Carousel } from '@/utils/types';
import { ArrowBack, ArrowForward } from '@vicons/ionicons5';
import { NCarousel, NIcon } from 'naive-ui';

interface Props {
  items: Carousel[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
});
</script>

<template>
  <NCarousel show-arrow autoplay>
    <div class="relative" v-for="item in items" :key="item.id">
      <p
        style="bottom: 55px; left: 0; right: 0; position: absolute; color: #fff; text-align: center"
      >
        <span
          class="text-white text-lg font-semibold"
          style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)"
        >
          {{ item.description }}
        </span>
        <br />
        <br />

        <a
          :href="item.linkUrl"
          v-if="item.linkText && item.linkUrl"
          class="hc-link inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-white transition-colors focus:outline-none focus:ring-2"
        >
          {{ item.linkText }}
        </a>
      </p>
      <img class="carousel-img" :src="getUploadedUrl(item.url)" />
    </div>
    <!-- <div>
      <span>Foo</span>

      <img
        class="carousel-img"
        src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"
      />
    </div>
    <div>
      <span>Foo</span>

      <img
        class="carousel-img"
        src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
      />
    </div>
    <div>
      <span>Foo</span>

      <img
        class="carousel-img"
        src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
      />
    </div> -->
    <template #arrow="{ prev, next }">
      <div class="custom-arrow">
        <button type="button" class="custom-arrow--left" @click="prev">
          <n-icon><ArrowBack /></n-icon>
        </button>
        <button type="button" class="custom-arrow--right" @click="next">
          <n-icon><ArrowForward /></n-icon>
        </button>
      </div>
    </template>
    <template #dots="{ total, currentIndex, to }">
      <ul class="custom-dots">
        <li
          v-for="index of total"
          :key="index"
          :class="{ ['is-active']: currentIndex === index - 1 }"
          @click="to(index - 1)"
        />
      </ul>
    </template>
  </NCarousel>
</template>

<style scoped>
.carousel-img {
  width: 100%;
  /* height: 400px; */
  aspect-ratio: 21/9;
  object-fit: cover;
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}

.custom-dots {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.custom-dots li {
  display: inline-block;
  width: 12px;
  height: 4px;
  margin: 0 3px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  transition:
    width 0.3s,
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-dots li.is-active {
  width: 40px;
  background: #fff;
}

@media (max-width: 700px) {
  .carousel-img {
    height: 240px;
  }
}

.custom-arrow button {
  background: rgba(0, 0, 0, 0.1);
}

.custom-arrow button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.hc-link {
  background-color: var(--primary-400);
  border-color: var(--primary-500);
}

.hc-link:hover {
  background-color: var(--primary-500);
}

.custom-arrow--left,
.custom-arrow--right {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
