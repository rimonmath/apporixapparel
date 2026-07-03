<script setup lang="ts">
import OnViewport from '@/components/others/OnViewport.vue';
import { NCollapse, NCollapseItem, NModal, NSpace } from 'naive-ui';
import { shallowRef } from 'vue';

// import { NLayout } from 'naive-ui';
const demoDialog = shallowRef(false);
const videoId = 'CjVNULElxXY';
const youtubeUrl = `https://www.youtube.com/embed/${videoId}`;
</script>

<template>
  <div class="landing-page">
    <div class="khudro-banner">
      <!-- <h1>Khudro Landing</h1> -->
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <OnViewport direction="left" :distance="60" :duration="800">
            <div class="my-10">
              <h1 class="text-4xl font-bold main-title">
                Be the next <br />
                Entrepreneur
              </h1>
              <p class="my-8 text-lg">
                KhudroShop is a platform for artisans to sell their products online.
              </p>

              <NSpace>
                <a href="https://demo.khudroshop.com" target="_blank">
                  <NButton size="large" type="primary">Store Front Demo</NButton>
                </a>

                <NButton size="large" type="primary" @click="demoDialog = true">
                  Dashboard Demo
                </NButton>
              </NSpace>

              <div class="mt-10 w-[332px]">
                <RouterLink to="/auth/signup">
                  <NButton size="large" type="info" block>Get Started</NButton>
                </RouterLink>
              </div>
            </div>
          </OnViewport>
          <OnViewport direction="right" :distance="60" :duration="800">
            <div class="text-right">
              <img class="inline-block max-h-150" src="/img/entrepreneur.svg" alt="" />
            </div>
          </OnViewport>
        </div>

        <!-- <div class="mt-5 text-center">
        <NButton size="large" type="info">Get Started</NButton>
      </div> -->
      </div>
    </div>

    <div class="py-20 bg-white">
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-30 items-center">
          <OnViewport direction="left" :distance="60" :duration="800">
            <div class="text-center">
              <img class="inline-block max-h-90" src="/img/steps.svg" alt="" />
            </div>
          </OnViewport>
          <OnViewport direction="right" :distance="60" :duration="800">
            <div class="text-center">
              <h2>Simple Steps to Make Your Website Live</h2>
              <p class="my-4">
                No need to learn design or development. We have simplified everything so you can
                build your store confidently, quickly, and without any technical knowledge
              </p>
            </div>
          </OnViewport>
        </div>
      </div>
    </div>

    <div class="py-20">
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-30 items-center">
          <OnViewport direction="left" :distance="60" :duration="800">
            <div class="text-center order-1 md:order-2">
              <img class="inline-block max-h-90" src="/img/performance.svg" alt="" />
            </div>
          </OnViewport>
          <OnViewport direction="right" :distance="60" :duration="800">
            <div class="text-center order-2 md:order-1">
              <h2>Performance is our first priority</h2>
              <p class="my-4">
                We focus on performance and speed to ensure your website runs smoothly and
                efficiently.
              </p>
            </div>
          </OnViewport>
        </div>
      </div>
    </div>

    <div class="py-20 bg-white">
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-30 items-center">
          <OnViewport direction="left" :distance="60" :duration="800">
            <div class="text-center">
              <img class="inline-block max-h-90" src="/img/web-development.svg" alt="" />
            </div>
          </OnViewport>
          <OnViewport direction="right" :distance="60" :duration="800">
            <div class="text-center">
              <h2>Custom Web Development</h2>
              <p class="my-4">
                If you have a very large store , And want a dedicated website, We also offer custom
                web development services to help you create a website that meets your specific
                needs.
              </p>
            </div>
          </OnViewport>
        </div>
      </div>
    </div>

    <div class="py-20">
      <div class="container">
        <!-- <hr class="my-5" /> -->
        <OnViewport direction="up" :distance="60" :duration="800">
          <h4 class="text-center">Frequently Asked Questions</h4>
          <div class="max-w-[500px] mx-auto my-6">
            <NCollapse accordion>
              <NCollapseItem title="How does Khudroshop help my business?" name="1">
                <template #header>
                  <h4>How does Khudroshop help my business?</h4>
                </template>
                <p class="pl-6">
                  Khudroshop is a platform that helps artisans to sell their products online. It is
                  a one-stop solution for all your e-commerce needs. It provides a user-friendly
                  interface and a wide range of features to help you manage your business
                  effectively.
                </p>
              </NCollapseItem>
              <NCollapseItem title="What are the benefits of using Khudroshop?" name="2">
                <template #header>
                  <h4>What are the benefits of using Khudroshop?</h4>
                </template>
                <p class="pl-6">
                  Khudroshop is a platform that helps artisans to sell their products online. It is
                  a one-stop solution for all your e-commerce needs. It provides a user-friendly
                  interface and a wide range of features to help you manage your business
                  effectively.
                </p>
              </NCollapseItem>
              <NCollapseItem title="What are the benefits of using Khudroshop?" name="3">
                <template #header>
                  <h4>What are the benefits of using Khudroshop?</h4>
                </template>
                <p class="pl-6">
                  Khudroshop is a platform that helps artisans to sell their products online. It is
                  a one-stop solution for all your e-commerce needs. It provides a user-friendly
                  interface and a wide range of features to help you manage your business
                  effectively.
                </p>
              </NCollapseItem>
            </NCollapse>
          </div>
        </OnViewport>
      </div>
    </div>

    <NModal
      v-model:show="demoDialog"
      preset="card"
      title="Khudroshop Dashboard Demo"
      :bordered="false"
      :style="{ width: '80%' }"
    >
      <div class="video-container">
        <iframe :src="youtubeUrl" allowfullscreen></iframe>
      </div>
    </NModal>
  </div>
</template>

<style>
.khudro-banner {
  min-height: 200px;
  background: var(--primary-500);
  background: linear-gradient(
    171deg,
    var(--primary-500) 0%,
    rgba(225, 252, 246, 1) 50%,
    rgba(255, 255, 255, 1) 100%
  );
}

.main-title {
  font-size: 66px !important;
}

@media (max-width: 768px) {
  .khudro-banner {
    border-bottom: 1px solid #eeeeee;
  }
  .main-title {
    font-size: 48px !important;
  }
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
