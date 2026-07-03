<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import {
  beautifyError,
  formatDateFromMilliSecond,
  formatDateWithTime,
  getUploadedUrl
} from '@/utils/functions';
import { addProductSchema } from '@/utils/schemas';
import type { SuccessResponse, Product, Order } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon,
  NTag
} from 'naive-ui';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
  shallowRef,
  watch
} from 'vue';
import {
  CheckmarkCircle,
  EllipsisVerticalOutline,
  EyeOutline,
  PencilOutline,
  TimerOutline,
  TrashBinOutline
} from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import EditProduct from '@/components/segments/EditProduct.vue';
import { API_DOMAIN } from '@/utils/data';
import { useStoreSidebar } from '@/composables/useStoreSidebar';
import { useStoreInfo } from '@/composables/useStoreInfo';
import OrderDetails from '@/components/segments/OrderDetails.vue';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const { ordersCountMachine } = useStoreSidebar();
const { subDomain } = useStoreInfo();

interface Props {
  orderStatus?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orderStatus: ''
});

const extra = computed(() => {
  let ext = '';
  if (props.orderStatus) {
    ext += 'orderStatus_eq=' + props.orderStatus;
  }

  if (ordersMachine.s.value) {
    ext += props.orderStatus ? '&' : '';
    ext += 'orderNumber_startsWith=' + ordersMachine.s.value;
  }

  return ext;
});

// const createMachine = useCreate<SuccessResponse>('/admin/products', true);
const ordersMachine = useRead<Order[], true>(`/store/${subDomain.value}/orders`, true, {
  route,
  router,
  extra
});
// const deleteMachine = useDelete<SuccessResponse>(true);

// const updateDialog = shallowRef(false);

const selectedItem: Record<string, any> = ref({});

const handleActionClick = (key: string, item: any) => {
  // // console.log(key, item);
  // if (key === 'Edit Product') {
  //   selectedItem.value = { ...item };
  //   updateDialog.value = true;
  // } else if (key === 'Delete') {
  //   selectedItem.value = { ...item };
  //   deleteMachine.dialog.value = true;
  // }
};

const deleteItem = async () => {
  // // console.log(selectedItem.value);
  // await deleteMachine.start('/admin/products/' + selectedItem.value.id);
  // if (deleteMachine.error.value) {
  //   message.error(beautifyError(deleteMachine.error.value));
  // } else {
  //   message.success(deleteMachine.response.value?.message!);
  //   deleteMachine.dialog.value = false;
  //   ordersMachine.start();
  // }
};

function handlePopState(event: any) {
  // // if modal is open, close it instead of navigating
  // if (updateDialog.value) {
  //   updateDialog.value = false;
  //   // prevent actual route change
  //   // history.pushState(null, '', location.href);
  // }
}

const selectedItemId = shallowRef(0);
const detailsDialog = shallowRef(false);

onMounted(() => {
  // window.addEventListener('popstate', handlePopState);
  ordersMachine.start();
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState);
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

watch(detailsDialog, (newValue, oldValue) => {
  if (!newValue) {
    ordersCountMachine.customStart();
    ordersMachine.start();
  }
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center">
      <h2 class="my-4">{{ orderStatus || 'All' }} Orders</h2>
      <div class="mb-2 md:mb-0">
        <n-input
          clearable
          placeholder="Search by order number..."
          v-model:value="ordersMachine.s.value"
        >
          <!-- <template #suffix> Search </template> -->
        </n-input>
      </div>
    </div>

    <NEmpty
      class="mt-10"
      description="No order found!"
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
            <th>User</th>
            <th>Items</th>
            <th>Order Status</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ordersMachine.response.value" :key="item.id">
            <td>{{ item.orderNumber }}</td>
            <td>{{ formatDateWithTime(item.createdAt) }}</td>
            <td>{{ item.user.name }}</td>
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
      <OrderDetails :orderId="selectedItemId" :editMode="true"></OrderDetails>
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
