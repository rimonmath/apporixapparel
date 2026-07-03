<script setup lang="ts">
import { useStoreInfo } from '@/composables/useStoreInfo';
import { useStoreSidebar } from '@/composables/useStoreSidebar';
import {
  AddOutline,
  AlbumsOutline,
  BarChartOutline,
  BicycleOutline,
  CalendarClearOutline,
  CaretDownOutline,
  CashOutline,
  EllipseOutline,
  GitMergeOutline,
  ImagesOutline,
  LayersOutline,
  NewspaperOutline,
  PeopleCircle,
  PeopleCircleOutline,
  PeopleOutline,
  QrCodeOutline,
  SettingsOutline,
  StatsChartOutline
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { computed, onMounted } from 'vue';

const props = withDefaults(defineProps<{ subDomain: string }>(), {});

const { ordersCountMachine } = useStoreSidebar();

onMounted(() => {
  ordersCountMachine.customStart();
});

const emit = defineEmits(['navItemClick']);

const navItems = computed(() => [
  {
    type: 'title',
    title: 'Main Menu',
    icon: null,
    to: ``
  },
  {
    type: 'item',
    title: 'Overview',
    icon: StatsChartOutline,
    to: `/store/${props.subDomain}`
  },
  {
    type: 'item',
    title: 'Categories',
    icon: GitMergeOutline,
    to: `/store/${props.subDomain}/categories`
  },
  {
    type: 'item',
    title: 'Products',
    icon: LayersOutline,
    to: `/store/${props.subDomain}/products`,
    children: [
      {
        type: 'item',
        title: 'All Products',
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/products`
      },
      {
        type: 'item',
        title: 'Product Attributes',
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/attributes`
      },
      {
        type: 'item',
        title: 'Out of Stock',
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/categories2`
      }
    ]
  },
  {
    type: 'item',
    title: 'Delivery Options',
    icon: BicycleOutline,
    to: `/store/${props.subDomain}/doptions`
  },
  {
    type: 'item',
    title: 'Coupons',
    icon: CashOutline,
    to: `/store/${props.subDomain}/coupons`
  },
  {
    type: 'item',
    title: 'Orders',
    icon: LayersOutline,
    to: `/store/${props.subDomain}/all-orders`,
    children: [
      {
        type: 'item',
        title: `All Orders (${ordersCountMachine.response?.value?.All || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/all-orders`
      },
      {
        type: 'item',
        title: `Placed Orders (${ordersCountMachine.response?.value?.Placed || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/placed-orders`
      },
      {
        type: 'item',
        title: `Confirmed Orders (${ordersCountMachine.response?.value?.Confirmed || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/confirmed-orders `
      },

      {
        type: 'item',
        title: `Processing Orders (${ordersCountMachine.response?.value?.Processing || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/processing-orders`
      },
      {
        type: 'item',
        title: `Packed Orders (${ordersCountMachine.response?.value?.Packed || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/packed-orders`
      },

      {
        type: 'item',
        title: `Shipped Orders (${ordersCountMachine.response?.value?.Shipped || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/shipped-orders`
      },
      {
        type: 'item',
        title: `Out For Delivery (${ordersCountMachine.response?.value?.['Out For Delivery'] || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/out-for-delivery-orders`
      },
      {
        type: 'item',
        title: `Delivered Orders (${ordersCountMachine.response?.value?.Delivered || 0})`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/delivered-orders`
      }
    ]
  },

  {
    type: 'item',
    title: 'Carousels',
    icon: ImagesOutline,
    to: `/store/${props.subDomain}/carousels`
  },

  {
    type: 'item',
    title: 'Pages',
    icon: CalendarClearOutline,
    to: `/store/${props.subDomain}/pages`
  },
  {
    type: 'item',
    title: 'Customers',
    icon: PeopleOutline,
    to: `/store/${props.subDomain}/customers`
  },
  {
    type: 'item',
    title: 'Settings',
    icon: SettingsOutline,
    to: `/store/${props.subDomain}/store-settings`,
    children: [
      {
        type: 'item',
        title: `Store Info`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/store-settings`
      },
      {
        type: 'item',
        title: `Appearence`,
        icon: EllipseOutline,
        to: `/store/${props.subDomain}/appearence`
      }
    ]
  }
  // {
  //   type: 'item',
  //   title: 'Analytics',
  //   icon: BarChartOutline,
  //   to: `/store/${props.subDomain}/analytics`
  // }
]);
</script>

<template>
  <div class="side-bar pb-20">
    <template v-for="item in navItems" :key="item.title">
      <div v-if="item.type === 'title'" class="sb__section-title pt-5 -b-2 px-4">
        {{ item.title }}
      </div>
      <div v-else-if="item.type === 'item'" class="sb__item mt-2">
        <SmartLink :to="item.to" @click="emit('navItemClick')" v-if="!item.children">
          <div class="flex items-center">
            <NIcon>
              <component :is="item.icon"></component>
            </NIcon>
            <span class="ml-2"> {{ item.title }} </span>
          </div>
        </SmartLink>

        <SmartLink :to="item.to" @click="emit('navItemClick')" v-if="item.children">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <NIcon>
                <component :is="item.icon"></component>
              </NIcon>
              <span class="ml-2"> {{ item.title }} </span>
            </div>

            <NIcon class="sb__arrow-icon"> <CaretDownOutline /> </NIcon>
          </div>
        </SmartLink>

        <template v-if="item.children">
          <div class="sb__item--level-1" v-for="child in item.children" :key="child.title">
            <SmartLink :to="child.to" @click="emit('navItemClick')">
              <div class="flex items-center">
                <NIcon>
                  <component :is="child.icon"></component>
                </NIcon>
                <span class="ml-2"> {{ child.title }} </span>
              </div>
            </SmartLink>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.side-bar {
  padding: 11px 0 50px 0;
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
