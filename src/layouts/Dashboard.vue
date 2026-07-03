<script setup lang="ts">
import SideBar from '@/components/segments/SideBar.vue';
import { NDropdown, NInput } from 'naive-ui';

import type { Component } from 'vue';
import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
  CaretDownOutline,
  MenuOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { h, onMounted, shallowRef } from 'vue';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import DashboardSidebar from '@/components/segments/DashboardSidebar.vue';
import { useRouter } from 'vue-router';
const authChecked = shallowRef(false);

const { getProileMacine } = useDashboardHeader();

const checkAuth = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    window.location.href = '/auth/signin';
    return;
  }
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
    label: 'My Profile',
    key: 'profile',
    icon: renderIcon(UserIcon)
  },
  {
    label: 'Signout',
    key: 'signout',
    icon: renderIcon(LogoutIcon)
  }
];

const router = useRouter();

function handleDropdownSelect(key: string) {
  if (key === 'signout') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/signin';
  } else if (key === 'profile') {
    router.push('/dashboard/my-profile');
  }
}

const sidebarExpanded = shallowRef(false);

onMounted(() => {
  if (checkAuth()) {
    getProileMacine.start();
  }
  document.body.style.setProperty('--primary-color', '#00ae64');
});
</script>

<template>
  <div class="dashboard" v-show="authChecked">
    <div class="dashboard__top">
      <div class="flex items-center p-4">
        <div class="dashboard__nav-icon mr-2 px-2" @click="sidebarExpanded = !sidebarExpanded">
          <NIcon>
            <MenuOutline></MenuOutline>
          </NIcon>
        </div>

        <SmartLink to="/">
          <div class="flex items-center">
            <img src="/img/logo.png" class="max-h-[33px]" alt="" />
            <div class="dashboard__logo-text ml-2 hidden md:inline-block">KhudroShop</div>
          </div>
        </SmartLink>
      </div>
      <div class="dashboard__search"></div>
      <div class="px-2">
        <div class="flex items-center space-x-2">
          <!-- <n-popover :overlap="false" placement="bottom" trigger="click">
            <template #trigger>
              <NButton circle>
                <template #icon>
                  <NIcon>
                    <NotificationsOutline />
                  </NIcon>
                </template>
              </NButton>
            </template>
            <div class="dashboard__notification" v-for="i in 5">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>

            <NButton quaternary block type="primary">See All</NButton>
          </n-popover> -->

          <div class="ml-2">
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
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard__bottom">
      <div class="dashboard__left" :class="{ 'dashboard__left--expanded': sidebarExpanded }">
        <!-- dashboard sidebar -->
        <DashboardSidebar @navItemClick="sidebarExpanded = false" />
      </div>
      <div class="dashboard__middle">
        <slot name="default"> </slot>
      </div>
      <div class="dashboard__right"></div>
    </div>
  </div>
</template>

<style>
.dashboard {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.dashboard__top {
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* border-bottom: 1px solid gray; */
}

.dashboard__notification {
  padding: 5px 15px;
  margin: 5px 0;
  max-width: 250px;

  cursor: pointer;
}

.dashboard__notification:hover {
  background-color: #f5f5f5;
}

.dashboard__nav-icon {
  display: none;
  font-size: 25px;
  cursor: pointer;
}

.dashboard__nav-icon:hover {
  background-color: #f8f8f8;
}

.dashboard__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: var(--primary-500);
}

.dashboard__bottom {
  background-color: #f8f8f8;
  height: 0;
  flex: 1;
  display: flex;
  border-radius: 11px;
  justify-content: space-between;
}

.dashboard__left {
  background-color: #eee;
  width: 250px;
  border-radius: 11px 0 0 0;
  border-top: 1px solid rgb(212, 212, 212);
  z-index: 999999;
  transition: left 0.25s;
  overflow-y: auto;
}

.dashboard__middle {
  width: 0;
  flex: 1;
  border-top: 1px solid rgb(212, 212, 212);
  min-width: 300px;
  /* background-color: red; */
  overflow-y: auto;
}

.dashboard__right {
  border-top: 1px solid rgb(212, 212, 212);
  border-radius: 0 11px 0 0;
  min-width: 11px;
  /* background-color: blue; */
}

@media only screen and (max-width: 700px) {
  .dashboard__nav-icon {
    display: inline-block;
  }

  .dashboard__left {
    position: fixed;
    left: -250px;
    top: 55px;
    bottom: 0;
  }

  .dashboard__left--expanded {
    left: 0;
  }
}
</style>
