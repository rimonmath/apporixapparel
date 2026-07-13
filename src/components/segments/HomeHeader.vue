<script setup lang="ts">
import { useHomeHeader } from '@/composables/useHomeHeader';
import { useHost } from '@/composables/useHost';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { getUploadedUrl, replaceSpaces } from '@/utils/functions';
import {
  AppsOutline,
  CaretForwardOutline,
  CartOutline,
  ChevronDownOutline,
  LogInOutline,
  MenuOutline,
  RadioButtonOffOutline,
  Search
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
import HomeLinks from './HomeLinks.vue';
const { categoriesMachine, categories, pagesMachine, storeDetailsMachine } = useHomeHeader();

// const { isKhudroshopHost } = useHost();

const customerToken = localStorage.getItem('customerToken');
const userType = localStorage.getItem('userType');

onMounted(() => {
  console.log('mounted');
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
  <div class="home-header py-3">
    <div class="draft-status" v-if="storeDetailsMachine.response.value?.status === 'Draft'">
      Draft
    </div>
    <div class="hh__middle">
      <div class="container flex justify-between items-center">
        <div>
          <SmartLink to="/" class="flex items-center gap-2" @click="rightDrawer = false">
            <img
              v-if="storeDetailsMachine.response.value?.logoUrl"
              :src="getUploadedUrl(storeDetailsMachine.response.value?.logoUrl || '')"
              alt="Logo"
              class="max-h-[36px]"
            />
            <h4
              class="hidden md:inline-block store-logo"
              v-if="storeDetailsMachine.response.value?.showNextToLogo"
            >
              {{ storeDetailsMachine.response.value?.name || 'KhudroShop' }}
            </h4>
          </SmartLink>
        </div>

        <div class="relative w-[200px] md:w-[370px]">
          <form @submit.prevent="search">
            <NInputGroup>
              <NInput
                :size="vw > 600 ? 'large' : 'small'"
                placeholder="Search..."
                v-model:value="searchKeyword"
              />
              <!-- <NButton attr-type="submit" type="warning"> Search </NButton> -->
              <button type="submit" class="search-button">
                <NIcon>
                  <Search />
                </NIcon>
              </button>
            </NInputGroup>
          </form>
        </div>

        <div class="flex itemc-center gap-2">
          <HomeLinks class="hidden md:flex" />
          <div class="hidden md:flex items-center gap-2">
            <SmartLink v-if="customerToken" to="/customer">
              <div class="flex items-center gap-2">
                <NIcon>
                  <AppsOutline />
                </NIcon>
                <span class="mr-2">My Account</span>
              </div>
            </SmartLink>

            <!-- <SmartLink v-if="!customerToken" to="/auth/signin">
              <div class="flex items-center gap-1">
                <NIcon>
                  <LogInOutline />
                </NIcon>
                <span>Signin</span>
              </div>
            </SmartLink>
            <SmartLink v-if="!customerToken && isKhudroshopHost" to="/auth/signup">Signup</SmartLink> -->
          </div>
        </div>

        <div
          class="hh_menu-icon text-2xl flex items-center md:hidden mr-2"
          @click="rightDrawer = !rightDrawer"
        >
          <NIcon>
            <MenuOutline />
          </NIcon>
        </div>
        <NDrawer v-model:show="rightDrawer" :width="300" placement="right" class="md:hidden">
          <NDrawerContent title="Menu" class="bg-primary-600">
            <div v-if="vw < 600" class="text-white">
              <HomeNav class="hn__nav--sm" @needToHide="rightDrawer = false" />

              <SmartLink v-if="customerToken" to="/customer">
                <div class="flex items-center gap-2 mt-2">
                  <!-- <NIcon>
                    <AppsOutline />
                  </NIcon> -->
                  <span class="mx-2">My Account</span>
                </div>
              </SmartLink>

              <SmartLink v-if="!customerToken" to="/auth/signin">
                <div class="flex items-center gap-1">
                  <NIcon>
                    <LogInOutline />
                  </NIcon>
                  <span>Signin</span>
                </div>
              </SmartLink>
              <SmartLink v-if="!customerToken" to="/auth/signup"> Signup </SmartLink>
            </div>
          </NDrawerContent>
        </NDrawer>
      </div>
    </div>
  </div>
</template>

<style>
.home-header {
  min-height: 22px;
  border-bottom: 1px solid #e0e0e0;
}

.hh__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  color: #fff;
}

.hh__top a {
  display: inline-block;
  margin: 3px;
  padding: 3px 5px;
}

.hh__middle {
  position: sticky;
  top: 0;
  min-height: 33px;
}

.hh__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: #1c85c2;
}

.hh__bottom {
  /* display: flex; */
}

.hh__bottom .container {
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

.search-button {
  background-color: none;
  border: none;
  padding: 2px 11px;
  color: var(--primary-600);
  cursor: pointer;
  transition: all 0.25s;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: var(--primary-50);
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
