<script setup>
import {
  AlbumsOutline,
  BarChartOutline,
  CaretDownOutline,
  EllipseOutline,
  LayersOutline,
  NewspaperOutline,
  PeopleCircle,
  PeopleCircleOutline,
  PeopleOutline,
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
      <SmartLink to="/dashboard" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <StatsChartOutline></StatsChartOutline>
          </NIcon>
          <span class="ml-2"> Overview </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink to="/dashboard/users" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <PeopleCircleOutline></PeopleCircleOutline>
          </NIcon>
          <span class="ml-2"> Users </span>
        </div>
      </SmartLink>
    </div>
    <div class="sb__item">
      <SmartLink to="/dashboard/categories" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <PeopleCircleOutline></PeopleCircleOutline>
          </NIcon>
          <span class="ml-2"> Categories </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink to="/dashboard/products">
        <div class="flex justify-between">
          <div class="flex items-center">
            <NIcon>
              <LayersOutline></LayersOutline>
            </NIcon>
            <span class="ml-2"> Products </span>
          </div>

          <NIcon class="sb__arrow-icon"> <CaretDownOutline /> </NIcon>
        </div>
      </SmartLink>

      <div class="sb__item--level-1">
        <SmartLink to="/dashboard/products" @click="emit('navItemClick')">
          <div class="flex items-center">
            <NIcon>
              <EllipseOutline></EllipseOutline>
            </NIcon>
            <span class="ml-2"> All Products </span>
          </div>
        </SmartLink>
      </div>
      <div class="sb__item--level-1">
        <SmartLink to="/dashboard/attributes" @click="emit('navItemClick')">
          <div class="flex items-center">
            <NIcon>
              <EllipseOutline></EllipseOutline>
            </NIcon>
            <span class="ml-2"> Product Attributes </span>
          </div>
        </SmartLink>
      </div>
      <div class="sb__item--level-1">
        <SmartLink to="/dashboard/categories2" @click="emit('navItemClick')">
          <div class="flex items-center">
            <NIcon>
              <EllipseOutline></EllipseOutline>
            </NIcon>
            <span class="ml-2"> Out of Stock </span>
          </div>
        </SmartLink>
      </div>
    </div>

    <div class="sb__item">
      <SmartLink to="/dashboard/customers" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <PeopleOutline></PeopleOutline>
          </NIcon>
          <span class="ml-2"> Customers </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink to="/dashboard/analytics" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <BarChartOutline></BarChartOutline>
          </NIcon>
          <span class="ml-2"> Analytics </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__section-title pt-8 pb-2 px-4">Apps</div>

    <div class="sb__item">
      <SmartLink to="/dashboard/bakir-khata" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <NewspaperOutline></NewspaperOutline>
          </NIcon>
          <span class="ml-2"> Bakir Khata </span>
        </div>
      </SmartLink>
    </div>

    <div class="sb__item">
      <SmartLink to="/dashboard/pos" @click="emit('navItemClick')">
        <div class="flex items-center">
          <NIcon>
            <QrCodeOutline></QrCodeOutline>
          </NIcon>
          <span class="ml-2"> POS Software </span>
        </div>
      </SmartLink>
    </div>
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
  padding-left: 33px;
  /* margin-left: 22px; */
  /* padding-left: 33px; */
}

.sb__item .sb__item--level-1 {
  display: none;
}

.sb__item:has(a.router-link-exact-active) {
  border-left: 4px solid var(--primary-500);
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
