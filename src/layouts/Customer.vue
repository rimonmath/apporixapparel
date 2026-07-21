<script setup lang="ts">
import SideBar from '@/components/segments/SideBar.vue';
import { NAlert, NDropdown, NInput } from 'naive-ui';

import type { Component } from 'vue';
import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
  CaretDownOutline,
  MenuOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { computed, h, nextTick, onMounted, shallowRef, watch } from 'vue';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { useRead } from '@/composables/useRead';
import { error } from 'naive-ui/es/_utils/naive/warn';
import { useRouter } from 'vue-router';
import { useStoreInfo } from '@/composables/useStoreInfo';
import CustomerSidebar from '@/components/segments/CustomerSidebar.vue';
import { useHomeHeader } from '@/composables/useHomeHeader';

const router = useRouter();

// const path = window.location.pathname.split('/');
// const subDomain = path[2];
// console.log(path);
// let customerInfoMachine;

const { storeDetailsMachine } = useHomeHeader();

const authChecked = shallowRef(false);
const authorized = shallowRef(false);
const { getProileMacine } = useDashboardHeader();

const checkAuth = () => {
  const customerToken = localStorage.getItem('customerToken');
  console.log('customerToken: ', customerToken);
  if (!customerToken || customerToken === 'undefined') {
    console.log('.... loging out...');
    window.location.href = '/auth/signin';
    return;
  }

  authChecked.value = true;
  return customerToken;
};

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
}

const options = [
  // {
  //   label: 'User Profile',
  //   key: 'profile',
  //   icon: renderIcon(UserIcon)
  // },
  // {
  //   label: 'Edit Profile',
  //   key: 'editProfile',
  //   icon: renderIcon(EditIcon)
  // },
  {
    label: 'Signout',
    key: 'signout',
    icon: renderIcon(LogoutIcon)
  }
];

function handleDropdownSelect(key: string) {
  if (key === 'signout') {
    localStorage.removeItem('customerToken');
    // localStorage.removeItem('refreshToken');
    window.location.href = '/auth/signin';
  }
}

const sidebarExpanded = shallowRef(false);

const unAuthorized = shallowRef(false);

onMounted(async () => {
  if (!checkAuth()) {
    return;
  }

  authorized.value = true;

  getProileMacine.start();
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
</script>

<template>
  <div v-if="!authChecked" class="p-20 text-center">
    <div class="container">
      <p>...</p>
    </div>
  </div>

  <div class="customer" v-else>
    <div class="customer__top">
      <div class="flex items-center p-4">
        <SmartLink to="/">
          <div class="flex items-center">
            <img src="/img/logo.png" class="max-h-[22px]" alt="" />
            <div class="customer__logo-text ml-2 hidden md:inline-block">
              {{ storeDetailsMachine.response.value?.name }}
            </div>
          </div>
        </SmartLink>
      </div>
      <div class="customer__search">
        <SmartLink
          to="/store"
          class="text-primary-500 hover:underline"
          v-if="getProileMacine.response.value?.userType === 'Admin'"
        >
          Store Dashboard
        </SmartLink>
        <!-- {{ getProileMacine.response.value?.name }} -->
      </div>
      <div class="px-2">
        <div class="flex items-center space-x-2">
          <div class="ml-2 flex items-center">
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
                    {{ getProileMacine.response.value?.name }}
                  </div>
                  <NIcon> <CaretDownOutline /> </NIcon>
                </div>
              </NButton>
            </NDropdown>

            <div class="customer__nav-icon mr-2 px-2" @click="sidebarExpanded = !sidebarExpanded">
              <NIcon>
                <MenuOutline></MenuOutline>
              </NIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="customer__bottom">
      <div class="customer__left"></div>
      <div class="customer__middle">
        <slot name="default"> </slot>
      </div>

      <div class="customer__right" :class="{ 'customer__right--expanded': sidebarExpanded }">
        <CustomerSidebar @navItemClick="sidebarExpanded = false" />
      </div>
    </div>
  </div>
</template>

<style>
.customer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.customer__top {
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* border-bottom: 1px solid gray; */
}

.customer__bottom {
  background-color: #f8f8f8;
  height: 0;
  flex: 1;
  display: flex;
  border-radius: 11px;
  justify-content: space-between;
}

.customer__left {
  border-top: 1px solid rgb(212, 212, 212);
  border-radius: 11px 0 0 0;
  min-width: 11px;
  /* background-color: blue; */
}

.customer__middle {
  width: 0;
  flex: 1;
  border-top: 1px solid rgb(212, 212, 212);
  min-width: 300px;
  /* background-color: red; */
  overflow-y: auto;
}

.customer__right {
  background-color: #eee;
  width: 250px;
  border-radius: 0 11px 0 0;
  border-top: 1px solid rgb(212, 212, 212);
  z-index: 999999;
  transition: right 0.25s;
}

.customer__notification {
  padding: 5px 15px;
  margin: 5px 0;
  max-width: 250px;

  cursor: pointer;
}

.customer__notification:hover {
  background-color: #f5f5f5;
}

.customer__nav-icon {
  display: none;
  font-size: 25px;
  cursor: pointer;
}

.customer__nav-icon:hover {
  background-color: #f8f8f8;
}

.customer__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: var(--primary-500);
}

@media only screen and (max-width: 700px) {
  .customer__nav-icon {
    display: inline-block;
  }

  .customer__right {
    position: fixed;
    right: -250px;
    top: 55px;
    bottom: 0;
  }

  .customer__right--expanded {
    right: 0;
  }
}
</style>
