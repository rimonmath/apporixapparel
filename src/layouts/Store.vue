<script setup lang="ts">
import { NAlert, NDrawer, NDrawerContent, NDropdown, NInput } from 'naive-ui';

import type { Component } from 'vue';
import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
  CaretDownOutline,
  MenuOutline,
  ArrowBackOutline,
  EarthOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { computed, h, nextTick, onMounted, shallowRef, watch } from 'vue';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { useRead } from '@/composables/useRead';
import { error } from 'naive-ui/es/_utils/naive/warn';
import { useRouter } from 'vue-router';
import { useStoreInfo } from '@/composables/useStoreInfo';
import StoreSidebar from '@/components/segments/StoreSidebar.vue';
import DomainSettings from '@/components/segments/DomainSettings.vue';

const router = useRouter();

// const path = window.location.pathname.split('/');
// const subDomain = path[2];
// console.log(path);
// let storeInfoMachine;

const { storeInfoMachine } = useStoreInfo();

const authChecked = shallowRef(false);
const authorized = shallowRef(false);
const { getProileMacine } = useDashboardHeader();

const checkAuth = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken || accessToken === 'undefined') {
    window.location.href = '/auth/signin';
    return;
  }

  unAuthorized.value = false;

  authChecked.value = true;
  return accessToken;
};

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
}

const options = [
  {
    label: 'Edit Profile',
    key: 'editProfile',
    icon: renderIcon(EditIcon)
  },
  {
    label: 'Signout',
    key: 'signout',
    icon: renderIcon(LogoutIcon)
  }
];

const sidebarExpanded = shallowRef(false);

const unAuthorized = shallowRef(true);

onMounted(async () => {
  if (!checkAuth()) {
    return;
  }

  authorized.value = true;

  await storeInfoMachine.start();

  if (storeInfoMachine.response.value) {
    document.body.style.setProperty(
      '--primary-color',
      storeInfoMachine.response.value.brandColor || '#000000'
    );
  }

  // getProileMacine.start();
});

const vw = innerWidth;
const rightDrawer = shallowRef(false);

function handleDropdownSelect(key: string) {
  if (key === 'signout') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/admin-signin';
  } else if (key === 'profile') {
    router.push('/user/my-profile');
  }
}

const origin = window.location.origin;
</script>

<template>
  <div v-if="unAuthorized" class="p-20 text-center">
    <div class="container">
      <NAlert :title="`Unauthorized!`" type="error">
        <p class="my-5">
          You are not authorized to access this store. Please contact the store owner for access.
        </p>
      </NAlert>

      <p class="mt-10">
        <SmartLink to="/dashboard">
          <NIcon>
            <LogoutIcon></LogoutIcon>
          </NIcon>
          Go Back to Dashboard
        </SmartLink>
      </p>
    </div>
  </div>

  <div class="store" v-else :style="{ '--brand-color': `#00ff00` }">
    <div class="store__top">
      <div class="flex items-center p-4 store__brand flex-1 md:flex-none">
        <div class="store__nav-icon mr-2 px-2" @click="sidebarExpanded = !sidebarExpanded">
          <NIcon>
            <MenuOutline></MenuOutline>
          </NIcon>
        </div>

        <div class="flex items-center gap-2">
          <div class="store__logo-text ml-2 text-white">Apporix Apparel</div>
        </div>
      </div>
      <div>
        <a :href="origin" target="_blank" rel="noopener noreferrer">View Website</a>
      </div>
      <div class="hidden md:inline-block">
        <!-- <DomainSettings></DomainSettings> -->
        <NDropdown
          :options="options"
          trigger="click"
          @select="handleDropdownSelect"
          :show-arrow="true"
          class="ml-3"
        >
          <NButton quaternary>
            <div class="flex items-center gap-x-2">
              <NIcon>
                <UserIcon></UserIcon>
              </NIcon>
              <div>
                {{ getProileMacine.response.value?.name || `Admin` }}
              </div>
              <NIcon> <CaretDownOutline /> </NIcon>
            </div>
          </NButton>
        </NDropdown>
      </div>
      <!-- <div class="domain-settings-menu md:hidden">
        <span class="text-2xl px-2" @click="rightDrawer = !rightDrawer">
          <NIcon>
            <EarthOutline></EarthOutline>
          </NIcon>
        </span>
        <NDrawer v-model:show="rightDrawer" :width="300" placement="right" class="md:hidden">
          <NDrawerContent title="Domain Settings">
            <div v-if="vw < 600">
              <DomainSettings></DomainSettings>
            </div>
          </NDrawerContent>
        </NDrawer>
      </div> -->
      <!-- <div class="hidden md:inline-block"></div> -->
    </div>
    <div class="store__bottom">
      <div class="store__left" :class="{ 'store__left--expanded': sidebarExpanded }">
        <StoreSidebar @navItemClick="sidebarExpanded = false" :subDomain="`subDomain`" />
      </div>
      <div class="store__middle">
        <slot name="default"> </slot>
      </div>
      <!-- <div class="store__right"></div> -->
    </div>
  </div>
  <!-- <div v-else></div> -->
</template>

<style>
.store {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.store__top {
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store__brand {
  width: 250px;
  background-color: var(--primary-500);
  color: #fff;
}

.store__bottom {
  /* background-color: #f8f8f8; */
  height: 0;
  flex: 1;
  display: flex;
  /* border-radius: 11px; */
  justify-content: space-between;
  background-color: #f8f8f8;
}

.store__left {
  background-color: var(--primary-50);
  width: 250px;
  /* border-radius: 11px 0 0 0; */
  border-top: 1px solid rgb(212, 212, 212);
  z-index: 999999;
  transition: left 0.25s;
  overflow-y: auto;
}

.store__middle {
  width: 0;
  flex: 1;
  border-top: 1px solid rgb(212, 212, 212);
  min-width: 300px;
  /* background-color: red; */
  overflow-y: auto;
}

.store__right {
  border-top: 1px solid rgb(212, 212, 212);
  border-radius: 0 11px 0 0;
  min-width: 11px;
  /* background-color: blue; */
}

.store__notification {
  padding: 5px 15px;
  margin: 5px 0;
  max-width: 250px;

  cursor: pointer;
}

.store__notification:hover {
  background-color: #f5f5f5;
}

.store__nav-icon {
  display: none;
  font-size: 25px;
  cursor: pointer;
}

.store__nav-icon:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.store__logo-text {
  font-weight: bold;
  font-size: 16px;
}

@media only screen and (max-width: 700px) {
  .store__nav-icon {
    display: inline-block;
  }

  .store__left {
    position: fixed;
    left: -250px;
    top: 55px;
    bottom: 0;
  }

  .store__left--expanded {
    left: 0;
  }
}

.domain-settings-menu {
  background-color: var(--primary-500);
  padding: 12px 0;
  color: #fff;
}
</style>
