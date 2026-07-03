<script setup lang="ts">
import {
  AddOutline,
  AlbumsOutline,
  BarChartOutline,
  BicycleOutline,
  CaretDownOutline,
  CashOutline,
  EllipseOutline,
  GitMergeOutline,
  LayersOutline,
  LocationOutline,
  NewspaperOutline,
  PeopleCircle,
  PeopleCircleOutline,
  PeopleOutline,
  PersonAddOutline,
  PersonOutline,
  QrCodeOutline,
  StatsChartOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';

const emit = defineEmits(['navItemClick']);
</script>

<template>
  <div class="side-bar">
    <div class="sb__section-title pt-5 -b-2 px-4">Main Menu</div>
    <div class="sb__item mt-2">
      <SmartLink :to="`/customer`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <StatsChartOutline></StatsChartOutline>
          </NIcon>
          <span class="ml-2"> Overview </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item mt-2">
      <SmartLink :to="`/customer/my-orders`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <AlbumsOutline></AlbumsOutline>
          </NIcon>
          <span class="ml-2"> My Orders </span>
        </div>
      </SmartLink>
    </div>

    <!-- <div class="sb__item mt-2">
      <SmartLink :to="`/customer/referrals`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <PersonAddOutline />
          </NIcon>
          <span class="ml-2"> Referrals </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item mt-2">
      <SmartLink :to="`/customer/my-profile`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <PersonOutline />
          </NIcon>
          <span class="ml-2"> My Profile </span>
        </div>
      </SmartLink>
    </div> -->

    <!-- <div class="sb__item mt-2">
      <SmartLink :to="`/customer/addresses`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <LocationOutline />
          </NIcon>
          <span class="ml-2"> My Addresses </span>
        </div>
      </SmartLink>
    </div> -->

    <!-- <div class="sb__section-title pt-8 pb-2 px-4">Apps</div>

    <div class="sb__item">
      <SmartLink :to="`/customer/bakir-khata`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <NewspaperOutline></NewspaperOutline>
          </NIcon>
          <span class="ml-2"> Bakir Khata </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink :to="`/customer/pos`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <QrCodeOutline></QrCodeOutline>
          </NIcon>
          <span class="ml-2"> POS Software </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink :to="`/customer/get-more-apps`" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <AddOutline></AddOutline>
          </NIcon>
          <span class="ml-2"> Get More Apps </span>
        </div>
      </SmartLink>
    </div> -->
  </div>
</template>

<style scoped>
.side-bar {
  padding: 11px 0;
}

.sb__item {
  border-left: 4px solid transparent;
  font-size: 15px;
}

.sb__item .sb__item--level-1 a {
  font-size: 13px;
  padding-right: 33px;
  /* margin-left: 22px; */
  /* padding-left: 33px; */
}

.sb__item .sb__item--level-1 {
  display: none;
}

.sb__item:has(a.router-link-exact-active) {
  border-right: 4px solid var(--primary-500);
}

.sb__item:has(.sb__item--level-1 a.router-link-exact-active) {
  background-color: rgba(0, 0, 0, 0.015);
  padding-top: 5px;
  padding-bottom: 15px;
}

.sb__arrow-icon {
  transition: transform 0.25s;
}
.sb__item:has(.sb__item--level-1 a.router-link-exact-active) .sb__arrow-icon {
  transform: rotate(180deg);
}

.sb__item:has(a.router-link-exact-active) .sb__item--level-1 {
  display: block;
}

.sb__item a {
  display: block;
  padding: 5px 15px;
  cursor: pointer;
  margin: 0 15px 0 10px;
  border-radius: 5px;
}

.sb__item a:not(.router-link-exact-active):hover {
  /* background-color: rgba(0, 0, 0, 0.05); */
}

.sb__item a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.8);
  color: var(--primary-900);
}

.sb__item:has(.sb__item--level-1 a.router-link-exact-active) > a.router-link-exact-active {
  background-color: transparent;
  color: #000;
}

.sb__section-title {
  font-size: 13px;
  color: gray;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
