<script setup lang="ts">
import OrderDetails from '@/components/segments/OrderDetails.vue';
import { useRead } from '@/composables/useRead';
import { formatDateWithTime, getUploadedUrl } from '@/utils/functions';
import type { Order } from '@/utils/types';
import {
  BanOutline,
  CheckmarkCircle,
  EllipsisVerticalOutline,
  Eye,
  EyeOutline,
  TimerOutline,
  TrashBinOutline
} from '@vicons/ionicons5';
import { NDropdown, NEmpty, NIcon, NModal, NPagination, NSelect, NTable, NTag } from 'naive-ui';
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const orderStatus = shallowRef('All');

const router = useRouter();
const route = useRoute();
const extra = computed(() =>
  orderStatus.value !== 'All' ? 'orderStatus_eq=' + orderStatus.value : ''
);

const ordersMachine = useRead<Order[], true>('/customer/orders', true, { route, router, extra });

type StatusType = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
const statusTypes = {
  Pending: 'warning' as StatusType,
  Paid: 'success' as StatusType,
  Failed: 'error' as StatusType,
  Refunded: 'error' as StatusType
};

const statusIcons = {
  Pending: TimerOutline,
  Paid: CheckmarkCircle,
  Failed: BanOutline,
  Refunded: TrashBinOutline
};

const selectedItemId = shallowRef(0);
const detailsDialog = shallowRef(false);

onMounted(() => {
  ordersMachine.start();
});
</script>

<template>
  <div class="container my-5">
    <div class="block md:flex justify-between items-center">
      <h4>My Orders</h4>
      <div class="min-w-[300px]">
        <div class="block md:flex items-center gap-2">
          <strong class="min-w-[120px]">Order Status:</strong>
          <NSelect
            @update:value="
              ordersMachine.resetPage();
              nextTick(() => {
                ordersMachine.start();
              });
            "
            v-model:value="orderStatus"
            :options="[
              { label: 'All', value: 'All' },
              { label: 'Placed', value: 'Placed' },
              { label: 'Confirmed', value: 'Confirmed' },
              { label: 'Packed', value: 'Packed' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Out For Delivery', value: 'Out For Delivery' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Cancelled', value: 'Cancelled' },
              { label: 'Return Requested', value: 'Return Requested' },
              { label: 'Return Approved', value: 'Return Approved' },
              { label: 'Return Rejected', value: 'Return Rejected' },
              { label: 'Return Received', value: 'Return Received' },
              { label: 'Returned', value: 'Returned' },
              { label: 'Refunded', value: 'Refunded' },
              { label: 'Failed', value: 'Failed' }
            ]"
            placeholder="Select Order Status"
          />
        </div>
      </div>
    </div>
    <hr class="my-2" />

    <NEmpty
      class="mt-10"
      description="No orders found!"
      v-if="!ordersMachine.loading.value && !ordersMachine.response.value?.length"
    >
    </NEmpty>
    <div class="table-container">
      <NTable
        :bordered="false"
        :single-line="false"
        class="mt-2"
        size="small"
        v-if="ordersMachine.response.value?.length"
      >
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Order Status</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ordersMachine.response.value" :key="item.id">
            <td>#{{ item.orderNumber }}</td>
            <td>{{ formatDateWithTime(item.createdAt) }}</td>
            <td>
              <!-- {{ item.orderItems.map((item) => item.product.title).join(', ') }} -->

              <div class="flex">
                <img
                  v-for="orderItem in item.orderItems"
                  :key="orderItem.id"
                  :src="getUploadedUrl(orderItem.image || orderItem.product.images[0].url)"
                  class="w-8 h-8 object-cover mr-1"
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

            <td>
              <NButton
                @click="
                  selectedItemId = item.id;
                  detailsDialog = true;
                "
                quaternary
                type="primary"
              >
                <NIcon>
                  <EyeOutline />
                </NIcon>
                <span class="flex ml-2">View Details</span>
              </NButton>
            </td>
          </tr>
        </tbody>
      </NTable>
    </div>
    <div class="my-4 p-2 bg-white flex justify-center" v-if="ordersMachine.response.value?.length">
      <NPagination
        v-model:page="ordersMachine.page.value"
        v-model:page-size="ordersMachine.pageSize.value"
        :page-count="ordersMachine.pageCount.value"
        show-size-picker
        :page-sizes="[1, 2, 5, 10, 20, 30, 40]"
        size="medium"
      />
    </div>

    <NModal
      v-model:show="detailsDialog"
      class="custom-modal"
      preset="card"
      title="Order Details"
      :bordered="false"
      :style="{ width: '100%', height: '100vh', backgroundColor: '#f8f8f8', overflowY: 'auto' }"
    >
      <OrderDetails :orderId="selectedItemId"></OrderDetails>
    </NModal>
  </div>
</template>
