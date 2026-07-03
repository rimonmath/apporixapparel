<script setup lang="ts">
import SideBar from '@/components/segments/SideBar.vue';
import { NAlert, NDropdown, NInput, useMessage } from 'naive-ui';

import type { Component } from 'vue';
import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
  CaretDownOutline,
  MenuOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { computed, h, nextTick, onMounted, shallowReactive, shallowRef, watch } from 'vue';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { useRead } from '@/composables/useRead';
import { error } from 'naive-ui/es/_utils/naive/warn';
import { useRouter } from 'vue-router';
import { useStoreInfo } from '@/composables/useStoreInfo';
import StoreSidebar from '@/components/segments/StoreSidebar.vue';
import { useCreate } from '@/composables/useCreate';
import type { SuccessResponse } from '@/utils/types';
import { beautifyError } from '@/utils/functions';
import { accountTerminationSchema } from '@/utils/schemas';
import AFormInput from '@/components/form/AFormInput.vue';
import AForm from '@/components/form/AForm.vue';
import GuestSidebar from '@/components/segments/GuestSidebar.vue';

const router = useRouter();

// const path = window.location.pathname.split('/');
// const subDomain = path[2];
// console.log(path);
// let storeInfoMachine;

// const { storeInfoMachine, subDomain } = useStoreInfo();
// localStorage.removeItem('lastUserAgent');

const lastUserAgent = shallowRef(localStorage.getItem('lastUserAgent'));

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
}

const options = [
  {
    label: 'Signout',
    key: 'signout',
    icon: renderIcon(LogoutIcon)
  }
];

function handleDropdownSelect(key: string) {
  if (key === 'signout') {
    localStorage.removeItem('lastUserAgent');
    // window.location.href = '/auth/signin';
    lastUserAgent.value = null;
  }
}

const sidebarExpanded = shallowRef(false);

onMounted(async () => {});

const message = useMessage();

const form = shallowReactive({
  subDomain: '',
  registeredEmail: '',
  registeredPassword: ''
});

const terminationMachine = useCreate<SuccessResponse & { lastUserAgent: string }>(
  '/auth/terminate-account'
);

async function handleSubmit() {
  //router.push('/dashboard')

  //return
  await terminationMachine.start(form);

  if (terminationMachine.error.value) {
    if (terminationMachine.error.value.redirect) {
      router.push(terminationMachine.error.value.redirect);
    }

    message.error(beautifyError(terminationMachine.error.value));
    return;
  }

  message.success(terminationMachine.response.value!.message);

  localStorage.setItem('lastUserAgent', terminationMachine.response.value!.lastUserAgent);
  lastUserAgent.value = terminationMachine.response.value!.lastUserAgent;
}
</script>

<template>
  <div class="login-container" v-if="!lastUserAgent">
    <div class="login-box">
      <div class="text-center mb-5">
        <img src="/img/logo.png" class="inline-block max-h-[50px]" alt="" />

        <h2 class="text-lg mt-4">Account Termination</h2>
      </div>
      <AForm @successSubmit="handleSubmit" :formData="form" :schema="accountTerminationSchema">
        <template #default="{ errors }">
          <AFormInput
            :formData="form"
            :errors="errors"
            name="subDomain"
            label="Subdomain"
            placeholder="Enter Subdomain"
          >
          </AFormInput>

          <AFormInput
            :formData="form"
            :errors="errors"
            name="registeredEmail"
            label="Registered Email"
            placeholder="Enter Registered Email"
          >
          </AFormInput>
          <AFormInput
            type="password"
            :formData="form"
            :errors="errors"
            name="registeredPassword"
            label="Registered Password"
            placeholder="Enter Registered Password"
            show-password-on="click"
          >
          </AFormInput>

          <div class="mt-2">
            <NButton
              type="error"
              attr-type="submit"
              class="login-btn"
              :loading="terminationMachine.loading.value"
              block
            >
              Terminate
            </NButton>
          </div>
        </template>
      </AForm>

      <p class="mt-2 text-center">
        <SmartLink to="/" class="back-home">← Back to Home</SmartLink>
      </p>

      <!-- <a href="#" class="back-home">← Back to Home</a> -->
    </div>
  </div>

  <div class="p-20" v-else-if="terminationMachine.loading.value">...</div>

  <div class="admin" v-else>
    <div class="admin__top">
      <div class="flex items-center p-4">
        <div class="admin__nav-icon mr-2 px-2" @click="sidebarExpanded = !sidebarExpanded">
          <NIcon>
            <MenuOutline></MenuOutline>
          </NIcon>
        </div>

        <SmartLink to="/dashboard">
          <div class="flex items-center">
            <img src="/img/logo.png" class="max-h-[33px]" alt="" />
            <div class="admin__logo-text ml-2 hidden md:inline-block">KhudroShop</div>
          </div>
        </SmartLink>
      </div>
      <div class="admin__search"></div>
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
            <div class="admin__notification" v-for="i in 5">
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
                  <div class="hidden md:inline-block">
                    {{ lastUserAgent.slice(-10) }}
                  </div>
                  <NIcon> <CaretDownOutline /> </NIcon>
                </div>
              </NButton>
            </NDropdown>
          </div>
        </div>
      </div>
    </div>
    <div class="admin__bottom">
      <div class="admin__left" :class="{ 'admin__left--expanded': sidebarExpanded }">
        <GuestSidebar @navItemClick="sidebarExpanded = false" />
      </div>
      <div class="admin__middle">
        <slot name="default"> </slot>
      </div>
      <div class="admin__right"></div>
    </div>
  </div>
</template>

<style>
.admin {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.admin__top {
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* border-bottom: 1px solid gray; */
  background-color: black;
  color: #fff;
}

.admin__bottom {
  background-color: #f8f8f8;
  height: 0;
  flex: 1;
  display: flex;
  border-radius: 11px;
  justify-content: space-between;
}

.admin__left {
  background-color: #eee;
  width: 250px;
  border-radius: 11px 0 0 0;
  border-top: 1px solid rgb(212, 212, 212);
  z-index: 999999;
  transition: left 0.25s;
  overflow-y: auto;
}

.admin__middle {
  width: 0;
  flex: 1;
  border-top: 1px solid rgb(212, 212, 212);
  min-width: 400px;
  /* background-color: red; */
  overflow-y: auto;
}

.admin__right {
  border-top: 1px solid rgb(212, 212, 212);
  border-radius: 0 11px 0 0;
  min-width: 11px;
  /* background-color: blue; */
}

.admin__notification {
  padding: 5px 15px;
  margin: 5px 0;
  max-width: 250px;

  cursor: pointer;
}

.admin__notification:hover {
  background-color: #f5f5f5;
}

.admin__nav-icon {
  display: none;
  font-size: 25px;
  cursor: pointer;
}

.admin__nav-icon:hover {
  background-color: #f8f8f8;
}

.admin__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: #1c85c2;
}

@media only screen and (max-width: 700px) {
  .admin__nav-icon {
    display: inline-block;
  }

  .admin__left {
    position: fixed;
    left: -250px;
    top: 55px;
    bottom: 0;
  }

  .admin__left--expanded {
    left: 0;
  }
}

.login-container {
  background: var(--primary-500);
  background: linear-gradient(
    171deg,
    rgba(255, 0, 0) 0%,
    rgba(225, 252, 246, 1) 80%,
    rgba(255, 255, 255, 1) 100%
  );
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
}
</style>
