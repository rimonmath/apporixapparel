<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import {
  beautifyVariation,
  beautifyError,
  cropText,
  formatDateWithTime,
  getUploadedUrl
} from '@/utils/functions';
import type { Order, SuccessResponse } from '@/utils/types';
import {
  NCard,
  NIcon,
  NInput,
  NPopover,
  NSelect,
  NTable,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef } from 'vue';
import CheckIcon from '../icons/CheckIcon.vue';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { addNextStepSchema } from '@/utils/schemas';
import AFormSelect from '../form/AFormSelect.vue';
import AFormInput from '../form/AFormInput.vue';
import AForm from '../form/AForm.vue';
import { useCreate } from '@/composables/useCreate';

interface Props {
  orderId: number;
  editMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orderId: 0,
  editMode: false
});

const { subDomain } = useStoreInfo();

const message = useMessage();

const allSteps = [
  'Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Return Requested',
  'Return Approved',
  'Return Rejected',
  'Return Received',
  'Returned',
  'Refunded',
  'Cancelled',
  'Failed'
];

const nextSteps = computed(() => {
  if (!readMachine.response.value) return [];

  const lastStep =
    readMachine.response.value?.orderStatusHistory[
      readMachine.response.value?.orderStatusHistory.length - 1
    ].status;
  const index = allSteps.indexOf(lastStep);
  return allSteps.slice(index + 1).map((step) => ({
    label: step,
    value: step
  }));
});

const nextStepForm = shallowReactive({
  status: null,
  note: ''
});

const detailsURL = props.editMode
  ? `/store/${subDomain.value}/orders/${props.orderId}`
  : `/customer/orders/${props.orderId}`;

const readMachine = useRead<Order, true>(detailsURL, true);

const getOrderDetails = () => {
  readMachine.start();
};

const remainingSteps = computed(() => {
  if (!readMachine.response.value) return 0;

  return 6 - readMachine.response.value?.orderStatusHistory.length;
});

const showNextStep = shallowRef(false);

const addNextStepMachine = useCreate<SuccessResponse>(
  '/store/' + subDomain.value + '/orders/' + props.orderId + '/add-next-step',
  true
);

const addNextStep = async () => {
  // showNextStep.value = false;
  await addNextStepMachine.start(nextStepForm);

  if (addNextStepMachine.error.value) {
    message.error(beautifyError(addNextStepMachine.error.value));
  } else {
    getOrderDetails();
    message.success('Order updated successfully!');
    showNextStep.value = false;
  }
};

onMounted(() => {
  getOrderDetails();
});
</script>

<template>
  <div>
    <div class="container">
      <!-- {{ readMachine.response.value }} -->

      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-7 mt-5">
        <div>
          <h4>Order Items (#{{ readMachine.response.value?.orderNumber }})</h4>

          <div class="table-container mt-2">
            <NTable>
              <tbody>
                <tr v-for="item in readMachine.response.value?.orderItems">
                  <td>
                    <img
                      :src="getUploadedUrl(item.image || item.product.images[0].url)"
                      class="h-15 w-15 rounded-xl"
                    />
                  </td>
                  <td>
                    <h6 :title="item.product.title">{{ cropText(item.product.title, 30) }}</h6>
                    <p>{{ beautifyVariation(item.variation) }}</p>
                  </td>
                  <td>
                    {{ item.quantity }}
                  </td>
                  <td>X</td>
                  <td>৳ {{ item.price }}</td>
                  <td>=</td>
                  <td class="text-right">৳{{ item.price * item.quantity }}</td>
                </tr>
                <tr>
                  <td colspan="6">
                    <div class="text-center">Sub total</div>
                  </td>
                  <td class="text-right">৳{{ readMachine.response.value?.subtotal }}</td>
                </tr>
              </tbody>
            </NTable>
          </div>

          <NTable class="mt-1">
            <tbody>
              <tr>
                <td>Delivery Option</td>
                <td>{{ readMachine.response.value?.deliveryOption }}</td>
                <td class="text-right">৳{{ readMachine.response.value?.deliveryCharge }}</td>
              </tr>
              <tr>
                <td>Coupon</td>
                <td>{{ readMachine.response.value?.coupon?.code }}</td>
                <td class="text-right">- ৳{{ readMachine.response.value?.couponDiscount }}</td>
              </tr>

              <tr>
                <td colspan="2">Tax Charge</td>

                <td class="text-right">৳{{ readMachine.response.value?.taxCharge }}</td>
              </tr>
              <tr>
                <th colspan="2">
                  <span class="text-orange-600"> Grand Total </span>
                </th>
                <th style="text-align: right">
                  <span class="text-orange-600"> ৳{{ readMachine.response.value?.total }} </span>
                </th>
              </tr>
            </tbody>
          </NTable>

          <!-- <hr class="my-4" /> -->

          <h4 class="mt-8">Payment Information</h4>
          <NCard class="mt-2">
            <div class="grid grid-cols-1 md:grid-cols-3">
              <div>
                <p class="font-bold">Payment Method</p>
                <p>{{ readMachine.response.value?.paymentMethod }}</p>
              </div>
              <div>
                <p class="font-bold">Payment Status</p>
                <p>{{ readMachine.response.value?.paymentStatus }}</p>
              </div>
              <div>
                <p class="font-bold">Transaction ID</p>
                <p>{{ readMachine.response.value?.transactionId || 'N/A' }}</p>
              </div>
            </div>
          </NCard>

          <h4 class="mt-4">Delivery Address</h4>
          <NCard class="mt-2 mb-10">
            <div>
              <div class="grid grid-cols-1 md:grid-cols-2">
                <div>
                  <p class="font-bold">Phone</p>
                  <p>{{ readMachine.response.value?.shippingAddress.phone }}</p>
                </div>
                <div>
                  <p class="font-bold">Order Note</p>
                  <p>{{ readMachine.response.value?.customerNote || 'N/A' }}</p>
                </div>
              </div>

              <p class="font-bold mt-2">Address</p>
              <p>
                {{ readMachine.response.value?.shippingAddress.name }} ,
                {{ readMachine.response.value?.shippingAddress.addressLine1 }},
                {{ readMachine.response.value?.shippingAddress.city }} -
                {{ readMachine.response.value?.shippingAddress.postalCode }},
                {{ readMachine.response.value?.shippingAddress.country }}
              </p>
            </div>
          </NCard>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h4>Order Timeline</h4>

            <NPopover
              trigger="click"
              raw
              :show-arrow="false"
              v-if="editMode"
              v-model:show="showNextStep"
            >
              <template #trigger>
                <NButton type="primary">Next Step</NButton>
              </template>
              <AForm
                @successSubmit="addNextStep"
                :formData="nextStepForm"
                :schema="addNextStepSchema"
              >
                <div class="bg-white p-5 space-y-2 w-[350px]" style="transform-origin: inherit">
                  <AFormSelect
                    label="Order Status"
                    name="status"
                    :options="nextSteps"
                    placeholder="Select Status"
                  />
                  <AFormInput label="Note" name="note" placeholder="Note" />
                  <NButton type="primary" block attr-type="submit">Add Step</NButton>
                </div>
              </AForm>
            </NPopover>
          </div>
          <NCard class="mt-2 min-h-[80vh]">
            <NTimeline size="large">
              <NTimelineItem
                v-for="item in readMachine.response.value?.orderStatusHistory"
                :key="item.id"
                type="success"
                :title="item.status"
                :content="item.note"
                :time="formatDateWithTime(item.createdAt)"
              >
                <template #icon>
                  <div class="text-xl">
                    <NIcon>
                      <CheckIcon />
                    </NIcon>
                  </div>
                </template>
              </NTimelineItem>

              <NTimelineItem class="opacity-25" content="Pending" v-for="i in remainingSteps" />
            </NTimeline>
          </NCard>
        </div>
      </div>
    </div>
  </div>
</template>
