<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCart } from '@/composables/useCart';
import { useCreate } from '@/composables/useCreate';
import { useDelete } from '@/composables/useDelete';
import { useRead } from '@/composables/useRead';
import { useSsoSignin } from '@/composables/useSsoSignin';
import { useUpdate } from '@/composables/useUpdate';
import { availablePaymentMethods } from '@/utils/data';
import { beautifyError } from '@/utils/functions';
import { addEditAddressSchema } from '@/utils/schemas';
import type { Address, Coupon, DeliveryOption, SuccessResponse } from '@/utils/types';
import {
  CallOutline,
  CreateOutline,
  LocationOutline,
  NavigateOutline,
  PencilOutline
} from '@vicons/ionicons5';
import { NButton, NIcon, NInput, NInputGroup, NModal, NSelect, useMessage } from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef } from 'vue';

const { openPopup } = useSsoSignin('/checkout');

const { totalCartPrice, totalCartItems, cartItems, clearCart } = useCart();
const message = useMessage();

const deliveryOptionsMachine = useRead<DeliveryOption[]>('/public/order/delivery-options');
const addressesMachine = useRead<Address[]>('/customer/profile/addresses', true);
const newAddressMachine = useCreate<SuccessResponse>('/customer/profile/addresses', true);
const placeOrderMachine = useCreate<SuccessResponse>('/customer/orders', true);

const applyCouponMachine = useRead<Coupon>('', true);

const deliveryOptionsMap = computed(() =>
  deliveryOptionsMachine.response.value?.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<number, DeliveryOption>
  )
);

const deliveryOptions = computed(() =>
  deliveryOptionsMachine.response.value?.map((item) => ({
    label: item.name,
    value: item.id
  }))
);

const selectedDeliveryOptionId = shallowRef<number | null>(null);

const selectedDeliveryOption = computed(() => {
  if (!deliveryOptionsMap.value || !selectedDeliveryOptionId.value) return null;
  return deliveryOptionsMap.value[selectedDeliveryOptionId.value];
});

const grandTotal = computed(() => {
  if (!selectedDeliveryOption.value) return totalCartPrice.value + couponDiscount.value;
  return totalCartPrice.value + Number(selectedDeliveryOption.value.charge) - couponDiscount.value;
});

const paymentMethods = shallowRef(availablePaymentMethods);

const selectedPaymentMethod = shallowRef<string | null>(null);

const AddressesMap = computed(() =>
  addressesMachine.response.value?.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<number, Address>
  )
);

const newAddressForm = shallowReactive({
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'Bangladesh',
  latitude: '',
  longitude: ''
});

const resetNewAddressForm = () => {
  Object.assign(newAddressForm, {
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
    latitude: '',
    longitude: ''
  });
};

const addNewAddress = async () => {
  if (newAddressMachine.error.value) {
    message.error(beautifyError(newAddressMachine.error.value));
    return;
  }
  await newAddressMachine.start(newAddressForm);
  resetNewAddressForm();
  message.success(newAddressMachine.response.value!.message);
  newAddressMachine.dialog.value = false;
  getAddresses();
};

const selectedAddressId = shallowRef<number>(0);
const customerNote = shallowRef<string>('');

const couponInfo = shallowReactive({
  id: 0,
  code: '',
  discount: 0,
  type: '',
  startDate: '',
  endDate: '',
  maxDiscount: 0
});

const couponDiscount = computed(() => {
  if (!couponInfo.type) {
    return 0;
  }

  if (couponInfo.type === 'fixed') {
    return couponInfo.discount;
  } else {
    return Math.min((couponInfo.discount / 100) * totalCartPrice.value, couponInfo.maxDiscount);
  }
});

const resetCouponInfo = () => {
  Object.assign(couponInfo, {
    id: 0,
    code: '',
    discount: 0,
    type: '',
    startDate: '',
    endDate: ''
  });
};

const applyCoupon = async () => {
  await applyCouponMachine.start(`/customer/orders/apply-coupon?code=${couponInfo.code}`);
  if (applyCouponMachine.error.value) {
    message.error(beautifyError(applyCouponMachine.error.value));
    return;
  }

  const couponResponse = applyCouponMachine.response.value;
  if (!couponResponse) return;

  couponInfo.id = applyCouponMachine.response.value!.id;
  couponInfo.code = applyCouponMachine.response.value!.code;
  couponInfo.discount = applyCouponMachine.response.value!.discount;
  couponInfo.type = applyCouponMachine.response.value!.type;
  couponInfo.startDate = applyCouponMachine.response.value!.startDate;
  couponInfo.endDate = applyCouponMachine.response.value!.endDate;
  couponInfo.maxDiscount = applyCouponMachine.response.value!.maxDiscount;
};

const placeOrder = async () => {
  if (selectedPaymentMethod.value !== 'Cash On Delivery') {
    message.error('Only Cash On Delivery is supported now!');
    return;
  }

  if (!selectedAddressId.value) {
    message.error('Please select a delivery address');
    return;
  }

  if (!selectedDeliveryOptionId.value) {
    message.error('Please select a delivery option');
    return;
  }

  const orderData = {
    shippingAddressId: selectedAddressId.value,
    billingAddressId: selectedAddressId.value,
    paymentMethod: selectedPaymentMethod.value,
    customerNote: customerNote.value,
    subtotal: totalCartPrice.value,
    couponId: couponInfo.id,
    couponDiscount: couponDiscount.value,
    taxCharge: '0',
    shippingCharge: '0',
    deliveryOption: selectedDeliveryOption.value?.name || '',
    deliveryCharge: selectedDeliveryOption.value?.charge || '0',
    total: grandTotal.value,
    cartItems: Object.keys(cartItems).map((key) => {
      const item = cartItems[key];
      return {
        productId: item.productId,
        variation: item.variation,
        image: item.productImage,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit
      };
    })
  };

  await placeOrderMachine.start(orderData);

  if (placeOrderMachine.error.value) {
    message.error(beautifyError(placeOrderMachine.error.value));
    return;
  }

  message.success(placeOrderMachine.response.value!.message);
  clearCart();
};

const getAddresses = async () => {
  await addressesMachine.start();
  if (addressesMachine.response.value?.length) {
    selectedAddressId.value = addressesMachine.response.value![0].id;
  }
};

const customerToken = localStorage.getItem('customerToken');

onMounted(async () => {
  await deliveryOptionsMachine.start();
  if (customerToken) {
    await getAddresses();
  }
});
</script>

<template>
  <!-- <div v-if="true" class="m-20">
    <p>Checkout is not available for now. Please visit back later.</p>
  </div> -->
  <div class="min-h-[90vh]">
    <div class="container py-6">
      <div v-if="totalCartPrice == 0" class="text-center">
        <p>Cart is empty. Please add some items to your cart.</p>
        <br />
        <SmartLink to="/">
          <NButton type="primary">Continue Shopping</NButton>
        </SmartLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm" v-if="!customerToken">
          <div class="text-center">
            <h2>Sign in to place an order</h2>

            <p class="my-5 text-lg">
              This is a khudroshop store. You can sign in with any Khudroshop account
            </p>
          </div>

          <!-- <NButton type="default" attr-type="submit" class="login-btn" block @click="openPopup">
            <div class="flex items-center gap-2">
              <img src="/img/logo.png" class="max-h-5" alt="" />
              <span> Sign in with khudroshop</span>
            </div>
          </NButton> -->

          <p class="my-3">
            By clicking on "Sign in with khudroshop" you agree to Khudroshop
            <a
              class="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
              href="https://khudroshop.com/terms.html"
              target="_blank"
            >
              Terms of Service
            </a>
            and
            <a
              class="text-blue-500 hover:text-blue-600 cursor-pointer hover:underline"
              href="https://khudroshop.com/privacy.html"
              target="_blank"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm" v-else>
          <div class="flex justify-between items-center">
            <h4>Select Delivery Address</h4>
            <NButton @click="newAddressMachine.dialog.value = true"> Add New Address </NButton>
          </div>

          <hr class="my-2" />

          <p
            class="my-2"
            v-if="addressesMachine.response.value?.length === 0 && !addressesMachine.loading.value"
          >
            You don't have any address saved
          </p>

          <div v-for="address in addressesMachine.response.value" :key="address.id" class="my-4">
            <div
              @click="selectedAddressId = address.id"
              :class="{
                'border-2 shadow-md selected-address': selectedAddressId === address.id,
                'border-gray-200': selectedAddressId !== address.id
              }"
              class="rounded-md grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-5 border p-4 cursor-pointer"
            >
              <div>
                <p class="flex items-center gap-2">
                  <NIcon>
                    <NavigateOutline />
                  </NIcon>
                  {{ address.name }}
                </p>
                <p class="flex items-center gap-2">
                  <NIcon>
                    <CallOutline />
                  </NIcon>
                  {{ address.phone }}
                </p>
              </div>
              <div>
                <div class="flex items-start">
                  <p class="mt-1">
                    <NIcon>
                      <LocationOutline />
                    </NIcon>
                  </p>

                  <p class="ml-2">
                    {{ address.addressLine1 }} {{ address.addressLine2 }},
                    {{ address.city }}
                    <br />
                    {{ address.postalCode }}, {{ address.country }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 mb-2">
            <strong>Customer Note (Optional)</strong>
          </div>

          <NInput
            label="Customer Note"
            type="textarea"
            placeholder="Enter note..."
            v-model:value="customerNote"
          />
        </div>
        <div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h4>Order Summary</h4>
            <hr class="my-2" />
            <table class="w-full order-summary-table">
              <tbody>
                <tr>
                  <th>Total Items</th>
                  <td>
                    {{ totalCartItems }}
                  </td>
                </tr>
                <tr>
                  <th>Sub Total</th>
                  <td>৳ {{ totalCartPrice }}</td>
                </tr>

                <tr>
                  <td colspan="2">
                    <hr />
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <NInputGroup>
                      <NInput
                        :style="{ width: '240px' }"
                        placeholder="COUPON CODE"
                        v-model:value="couponInfo.code"
                      />
                      <NButton
                        attr-type="submit"
                        type="primary"
                        @click="applyCoupon"
                        :disabled="couponInfo.type !== ''"
                        :loading="applyCouponMachine.loading.value"
                      >
                        {{ couponInfo.type ? 'Applied' : 'Apply' }}
                      </NButton>
                    </NInputGroup>
                  </td>
                </tr>

                <tr>
                  <th>Coupon Discount</th>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>৳ {{ couponDiscount }}</span>
                      <span class="cursor-pointer" v-if="couponInfo.type" @click="resetCouponInfo">
                        <NIcon>
                          <CreateOutline />
                        </NIcon>
                      </span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <hr />
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <div class="mb-1">
                      <strong>Delivery Option</strong>
                    </div>
                    <NSelect
                      placeholder="Delivery Option"
                      :options="deliveryOptions"
                      v-model:value="selectedDeliveryOptionId"
                      class="w-full"
                    />
                  </td>
                </tr>

                <tr v-if="selectedDeliveryOption">
                  <th>Delivery Charge</th>
                  <td>৳ {{ selectedDeliveryOption?.charge || 0 }}</td>
                </tr>

                <tr v-if="selectedDeliveryOption">
                  <td colspan="2">
                    <hr />
                  </td>
                </tr>

                <tr v-if="selectedDeliveryOption" class="text-orange-600">
                  <th>Grand Total</th>
                  <td>
                    ৳
                    {{ grandTotal }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="bg-white p-6 rounded-xl shadow-sm mt-4"
            v-if="selectedDeliveryOption && customerToken"
          >
            <div class="mb-1">
              <strong>Payment Method</strong>
            </div>
            <NSelect
              placeholder="Delivery Option"
              :options="paymentMethods"
              v-model:value="selectedPaymentMethod"
              class="w-full"
            />
            <div class="mt-4" v-if="selectedPaymentMethod">
              <NButton type="primary" block :disabled="!selectedAddressId" @click="placeOrder">
                Place Order
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <NModal
      v-model:show="newAddressMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add New Address"
      :bordered="false"
      :style="{ width: '600px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        @successSubmit="addNewAddress"
        :formData="newAddressForm"
        :schema="addEditAddressSchema"
      >
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AFormInput name="name" placeholder="Home1 / Office 2" label="Name" />
            <AFormInput name="phone" placeholder="Phone" label="Phone" />
          </div>
          <AFormInput name="addressLine1" placeholder="Address Line 1" label="Address Line 1" />
          <AFormInput
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            label="Address Line 2 (Optional)"
          />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
            <AFormInput name="city" placeholder="City" label="City" />
            <AFormInput name="postalCode" placeholder="Postal Code" label="Postal Code" />
            <AFormInput name="country" placeholder="Country" label="Country" />
          </div>

          <NButton type="primary" block attr-type="submit"> Add Address </NButton>
        </div>
      </AForm>
    </NModal>
  </div>
</template>

<style>
.order-summary-table {
  width: 100%;
}

.order-summary-table th {
  text-align: left;
  padding: 5px;
}

.order-summary-table td {
  /* text-align: right; */
  padding: 5px;
}

.selected-address {
  border-color: var(--primary-400);
}
</style>
