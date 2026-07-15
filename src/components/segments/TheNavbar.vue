<script setup lang="ts">
import { useHomeHeader } from '@/composables/useHomeHeader';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { getUploadedUrl, replaceSpaces } from '@/utils/functions';
import {
  AppsOutline,
  CaretForwardOutline,
  CartOutline,
  ChevronDownOutline,
  LogInOutline,
  MenuOutline,
  RadioButtonOffOutline
} from '@vicons/ionicons5';
import {
  NCollapse,
  NCollapseItem,
  NDrawer,
  NDrawerContent,
  NIcon,
  NInput,
  NInputGroup,
  NPopover,
  NSpace
} from 'naive-ui';
import { onMounted, shallowRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import HomeNav from './HomeNav.vue';
const { categoriesMachine, categories, pagesMachine, storeDetailsMachine } = useHomeHeader();

const accessToken = localStorage.getItem('accessToken');
const userType = localStorage.getItem('userType');

onMounted(() => {
  categoriesMachine.start();
  pagesMachine.start();
  storeDetailsMachine.start();
});

watch(
  () => storeDetailsMachine.response.value?.brandColor,
  (newValue) => {
    console.log(newValue);
    if (newValue) {
      // document.body.style.setProperty('--primary-color', newValue);

      document.body.style.setProperty('--primary-color', newValue || '#000000');
    }
  }
);

const searchKeyword = shallowRef('');
const searching = shallowRef(false);
const router = useRouter();
const search = () => {
  searching.value = false;
  if (!searchKeyword.value) {
    return;
  }
  router.push('/search/' + searchKeyword.value);
};

const rightDrawer = shallowRef(false);

const vw = innerWidth;
</script>

<template>
  <div class="the-navbar py-3">
    <div class="tn__middle">
      <div class="container flex justify-between items-center">
        <HomeNav class="hidden md:flex" />
      </div>
    </div>
  </div>
</template>

<style>
.the-navbar {
  min-height: 22px;
  background-color: var(--primary-500);
  color: #fff;
  position: sticky;
  top: 0;
}

.tn__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  color: #fff;
}

.tn__top a {
  display: inline-block;
  margin: 3px;
  padding: 3px 5px;
}

.tn__middle {
  position: sticky;
  top: 0;
  min-height: 33px;
}

.tn__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: #1c85c2;
}

.tn__bottom {
  /* display: flex; */
}

.tn__bottom .container {
  display: flex;
  justify-content: center;
}

div > .childs {
  display: none;
}

div:hover > .childs {
  display: block;
}

.all-categories a {
  padding-top: 5px;
  padding-bottom: 5px;
}

.n-collapse .n-collapse-item .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
  padding-top: 5px;
}

.store-logo {
  color: var(--primary-700) !important;
  font-weight: bold;
}

.draft-status {
  position: fixed;
  top: 0;
  left: 0;
  width: 166px;
  padding: 9px;
  background-color: rgb(243, 164, 17);
  color: #fff;
  text-align: center;
  z-index: 9999;
  transform: translate(-43px, 20px) rotate(-45deg);
}
</style>
