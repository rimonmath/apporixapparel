<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import PricingCard from '@/components/segments/PricingCard.vue';
import StatCard from '@/components/segments/StatCard.vue';
import { useRead } from '@/composables/useRead';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { formatDateWithTime, getUploadedUrl } from '@/utils/functions';
import type { Order, Package } from '@/utils/types';
import {
  CaretDownOutline,
  CheckmarkCircle,
  ChevronForwardCircleOutline,
  ChevronForwardOutline,
  PencilOutline,
  TimerOutline,
  TrashBinOutline
} from '@vicons/ionicons5';
import { NAlert, NCollapseTransition, NIcon, NModal, NTable, NTag } from 'naive-ui';
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// const path = window.location.pathname.split('/');
// const subDomain = path[2];
// console.log(path);

const { storeInfoMachine } = useStoreInfo();

const route = useRoute();
const router = useRouter();

const getPackagesMacine = useRead<Package[]>('/public/packages');
const RecentOrdersMachine = useRead<Order[], true>(`/store/orders`, true, {
  route,
  router,
  extra: ''
});

const selectedPackage = ref<Package | null>(null);
const getStartedDialog = ref(false);

const showChangePackage = shallowRef(false);

const mbUsed = computed(() => {
  const productImagesMB =
    ((storeInfoMachine.response.value?.totalProductImagesCount || 0) * 30) / 1024;
  const ordersMB = ((storeInfoMachine.response.value?.totalOrdersCount || 0) * 10) / 1024;
  const categoriesMB = ((storeInfoMachine.response.value?.categoryCount || 0) * 10) / 1024;

  return Number(((productImagesMB + ordersMB + categoriesMB) * 3).toFixed(2));
});

const statusTypes = {
  Draft: 'default' as StatusType,
  Pending: 'warning' as StatusType,
  Published: 'success' as StatusType,
  Archived: 'default' as StatusType
};

type StatusType =
  | 'Placed'
  | 'Confirmed'
  | 'Shipped'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

const statusIcons = {
  Pending: TimerOutline,
  Placed: CheckmarkCircle,
  Confirmed: TimerOutline,
  Shipped: PencilOutline,
  'Out For Delivery': TrashBinOutline,
  Delivered: CheckmarkCircle,
  Cancelled: TrashBinOutline,
  Returned: TrashBinOutline
};

onMounted(() => {
  // storeInfoMachine.start();
  // getPackagesMacine.start();
  // RecentOrdersMachine.start();
});
</script>

<template>
  <div class="overview pb-10">
    <h4 class="mt-4">Statistics</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-5">
      <StatCard
        title="Monthly Orders"
        :quota="storeInfoMachine.response.value?.package?.monthlyOrdersLimit || 0"
        :used="storeInfoMachine.response.value?.thisMonthOrdersCount || 0"
      />
      <StatCard
        title="Storage in MB"
        :quota="storeInfoMachine.response.value?.package?.storageLimitMb || 0"
        :used="mbUsed"
      />

      <StatCard
        title="Total Products"
        :quota="Infinity"
        :used="storeInfoMachine.response.value?.productCount || 0"
      />

      <StatCard
        title="Total Categories"
        :quota="Infinity"
        :used="storeInfoMachine.response.value?.categoryCount || 0"
      />
    </div>

    <!-- Card 3: Compact stat with progress bar -->

    <h4 class="mt-10">Recent Orders</h4>
    <div class="table-container">
      <!-- {{ RecentOrdersMachine.response.value }} -->
      <NTable
        :bordered="false"
        :single-line="false"
        class="mt-2"
        size="small"
        v-if="RecentOrdersMachine.response.value?.length"
      >
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Order Date</th>
            <th>User</th>
            <th>Items</th>
            <th>Order Status</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in RecentOrdersMachine.response.value" :key="item.id">
            <td>{{ item.orderNumber }}</td>
            <td>{{ formatDateWithTime(item.createdAt) }}</td>
            <td>{{ item.user.name }}</td>
            <td>
              <!-- {{ item.orderItems.map((item) => item.product.title).join(', ') }} -->

              <div class="flex">
                <img
                  v-for="orderItem in item.orderItems"
                  :key="orderItem.id"
                  :src="getUploadedUrl(orderItem.product.images[0].url)"
                  class="w-8 h-8 object-cover"
                />
              </div>
            </td>
            <td>
              {{ item.orderStatus }}
            </td>
            <td>
              <NTag :type="statusTypes[item.paymentStatus]" :bordered="false" size="small" round>
                {{ item.paymentStatus }}
                <template #icon>
                  <NIcon :component="statusIcons[item.paymentStatus]" />
                </template>
              </NTag>
            </td>
          </tr>
        </tbody>
      </NTable>
    </div>

    <NModal
      v-model:show="getStartedDialog"
      class="custom-card"
      preset="card"
      :title="`Subscribe to ${selectedPackage?.name} package`"
      :bordered="false"
      :style="{ width: '400px', maxWidth: '90%' }"
    >
      <div class="p-5">
        <p>To Activate this package you need to pay</p>
        <p class="my-3">
          <strong>
            ${{ selectedPackage?.monthlyChargeInUsd }} = TK.{{
              selectedPackage?.monthlyChargeInUsd! * 125
            }}</strong
          >
          (Estimated)
        </p>

        <p class="mb-8">Please contact Admin for details (+8801723702957)</p>
        <p class="text-center">
          <a target="_blank" :href="`https://wa.me/+8801723702957`">
            <NButton type="primary">Contact Admin</NButton>
          </a>
        </p>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.overview {
  width: 95%;
  /* max-width: 800px; */
  margin: 0 auto;
  /* background-color: turquoise; */
}
</style>
