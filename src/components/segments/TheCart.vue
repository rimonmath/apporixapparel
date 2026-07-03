<script lang="ts" setup>
import { NButton, NEmpty, NIcon, NInputNumber } from 'naive-ui';
import UpDown from '../form/UpDown.vue';
import { useCart } from '@/composables/useCart';
import { beautifyVariation, cropText, getUploadedUrl } from '@/utils/functions';
import { useRouter } from 'vue-router';

const {
  cartItems,
  addItem,
  removeItem,
  increaseOneQuantity,
  decreaseOneQuantity,
  totalCartPrice,
  isEmpty,
  direction,
  cartOpened
} = useCart();

const router = useRouter();

const checkout = () => {
  cartOpened.value = false;
  router.push('/checkout');
};
</script>

<template>
  <div class="the-cart">
    <!-- <h1 class="text-2xl font-bold mb-6">Shopping Cart</h1> -->
    <!-- {{ cartItems }} -->
    <template v-for="(cartItem, variation) in cartItems">
      <div class="flex items-center gap-2 py-1">
        <UpDown v-model="cartItem.quantity"></UpDown>
        <img :src="getUploadedUrl(cartItem.productImage)" class="h-15 w-15 rounded-xl" />
        <div class="flex-1">
          <h6 class="w-[100px] md:w-[250px]" :title="cartItem.productTitle">
            {{ cropText(cartItem.productTitle, 50) }}
          </h6>
          <p class="text-gray-500 text-xs" v-if="cartItem.variation !== 'Default'">
            {{ beautifyVariation(cartItem.variation) }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg">
            <transition
              enter-active-class="transition duration-300"
              leave-active-class="transition duration-300"
              :enter-from-class="
                direction === 'down' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
              "
              :leave-to-class="
                direction === 'down' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
              "
              mode="out-in"
              ><span :key="cartItem.pricePerUnit * cartItem.quantity" class="inline-block">
                ৳ {{ cartItem.pricePerUnit * cartItem.quantity }}
              </span></transition
            >
          </p>
          <NButton
            size="tiny"
            type="error"
            quaternary
            @click="removeItem(cartItem.productId, cartItem.variation)"
          >
            Remove
          </NButton>
        </div>
      </div>
      <hr />
    </template>

    <NEmpty class="mt-10" description="Your cart is empty" v-if="isEmpty"> </NEmpty>
    <div class="mt-6 text-right" v-else>
      <p class="text-lg font-semibold text-orange-600">
        Subtotal: ৳
        <transition
          enter-active-class="transition duration-300"
          leave-active-class="transition duration-300"
          :enter-from-class="
            direction === 'down' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
          "
          :leave-to-class="
            direction === 'down' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
          "
          mode="out-in"
          ><span :key="totalCartPrice" class="inline-block">
            {{ totalCartPrice }}
          </span>
        </transition>
      </p>
      <p class="text-gray-500 text-sm my-2">Shipping calculated at checkout</p>
      <NButton type="primary" @click="checkout"> Checkout </NButton>
    </div>
  </div>
</template>
