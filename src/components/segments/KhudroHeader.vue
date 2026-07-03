<script setup lang="ts">
import { AppsOutline, PeopleOutline, PersonOutline } from '@vicons/ionicons5';
import { NIcon, NPopover } from 'naive-ui';
const accessToken = localStorage.getItem('accessToken');
const userType = localStorage.getItem('userType');
</script>

<template>
  <div class="khudro-header">
    <div class="kh__middle mb-2 py-2">
      <div class="container flex justify-between items-center">
        <SmartLink to="/">
          <div class="flex items-center">
            <img src="/img/logo.png" class="max-h-[30px]" alt="" />
            <div class="ml-1 hidden md:inline-block logo-text text-2xl font-bold">KhudroShop</div>
          </div>
        </SmartLink>

        <div class="kh__nav">
          <SmartLink to="/doc">
            Doc<span class="hidden md:inline-block">umentation</span>
          </SmartLink>

          <SmartLink to="/pricing"> Pricing </SmartLink>
          <!-- <SmartLink to="/funding"> Funding </SmartLink> -->
          <SmartLink to="/about"> About Us</SmartLink>
        </div>
        <div class="hidden md:inline-block space-x-2">
          <SmartLink to="/auth/signin" v-if="!accessToken">
            <NButton type="default">Signin</NButton>
          </SmartLink>
          <SmartLink to="/auth/signup" v-if="!accessToken">
            <NButton type="primary">Signup</NButton>
          </SmartLink>
          <SmartLink to="/dashboard" v-if="accessToken" class="inline-flex gap-2 items-center">
            <NIcon size="15"> <AppsOutline /></NIcon> Dashboard
          </SmartLink>
        </div>

        <div class="inline-block md:hidden space-x-2">
          <NPopover>
            <template #trigger>
              <NButton size="small">
                <NIcon>
                  <PersonOutline />
                </NIcon>
              </NButton>
            </template>
            <div class="space-x-2">
              <SmartLink to="/auth/signin" v-if="!accessToken">
                <NButton type="default">Signin</NButton>
              </SmartLink>
              <SmartLink to="/auth/signup" v-if="!accessToken">
                <NButton type="primary">Signup</NButton>
              </SmartLink>
              <SmartLink to="/dashboard" v-if="accessToken" class="inline-flex gap-2 items-center">
                <NIcon size="15"> <AppsOutline /></NIcon> Dashboard
              </SmartLink>
            </div>
          </NPopover>
        </div>
      </div>
    </div>
    <div class="kh__bottom">
      <div class="container"></div>
    </div>
  </div>
</template>

<style>
.khudro-header {
  min-height: 55px;
  background-color: var(--primary-5);
}

.kh__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  color: #fff;
  background-color: var(--primary-500);
}

.kh__top a {
  display: inline-block;
  margin: 3px;
  padding: 3px 5px;
}

.kh__middle {
  position: sticky;
  top: 0;
  min-height: 33px;
}

.kh__logo-text {
  font-weight: bold;
  font-size: 25px;
  color: #1c85c2;
}

.kh__bottom {
  /* display: flex; */
}

.kh__bottom .container {
  display: flex;
  justify-content: center;
}

.kh__nav a,
.kh__nav .a {
  display: inline-block;
  padding: 4px 8px;
  margin: 2px 5px;
  font-weight: bold;
  cursor: pointer;
}

.kh__nav a.router-link-exact-active {
  color: #d35400;
}

.categories {
  width: 98%;
  max-width: 960px;
}

.category-item a:hover {
  text-decoration: underline;
}

.kh__nav a.inline-flex,
.kh__nav .a.inline-flex {
  display: inline-flex;
}

@media only screen and (max-width: 600px) {
  .kh__nav a,
  .kh__nav .a {
    margin: 2px 2px;
  }

  .kh__nav a.hidden {
    display: none;
  }
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
</style>
