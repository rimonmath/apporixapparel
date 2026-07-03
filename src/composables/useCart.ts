// composables/useCounter.ts
// import { onMounted, ref, shallowReactive } from 'vue';
import type { Product } from '@/utils/types';
import { computed, reactive, ref, shallowRef, watch } from 'vue';

type CartItem = {
  productId: number;
  variation: string;
  quantity: number;
  pricePerUnit: number;
  productTitle: string;
  productImage: string;
};

const cartItems = reactive<Record<string, CartItem>>(
  JSON.parse(localStorage.getItem('cartItems') || '{}')
);

const direction = shallowRef('up');
const cartOpened = shallowRef(false);
const addingToCart = shallowRef(false);

export function useCart() {
  const addItem = (item: CartItem) => {
    addingToCart.value = true;
    const alreadyExists = cartItems[item.productId + '::' + item.variation];

    if (alreadyExists) {
      cartItems[item.productId + '::' + item.variation] = {
        ...item,
        quantity: alreadyExists.quantity + item.quantity
      };
    } else {
      cartItems[item.productId + '::' + item.variation] = item;
    }

    setTimeout(() => {
      addingToCart.value = false;
    }, 1000);
  };

  const removeItem = (productId: number, variation: string) => {
    const itemToRemove = cartItems[productId + '::' + variation];

    if (itemToRemove) {
      delete cartItems[productId + '::' + variation];
    }
  };

  const increaseOneQuantity = (productId: number, variation: string) => {
    const item = cartItems[productId + '::' + variation];
    if (item) {
      item.quantity += 1;
    }
  };

  const decreaseOneQuantity = (productId: number, variation: string) => {
    const item = cartItems[productId + '::' + variation];
    if (item) {
      item.quantity -= 1;
    }
  };

  const clearCart = () => {
    console.log('clearing...');
    for (const key in cartItems) {
      delete cartItems[key];
    }
    localStorage.setItem('cartItems', '{}'); // also clear storage
    console.log('cleared');
  };

  const totalCartItems = computed(() => {
    return Object.values(cartItems).reduce((acc, item) => acc + item.quantity, 0);
  });

  const totalCartPrice = computed(() => {
    return Object.values(cartItems).reduce(
      (acc, item) => acc + item.pricePerUnit * item.quantity,
      0
    );
  });

  const isEmpty = computed(() => {
    return Object.keys(cartItems).length === 0;
  });

  watch(totalCartPrice, (newVal: number, oldValue: number) => {
    if (newVal > oldValue) {
      direction.value = 'up';
    } else {
      direction.value = 'down';
    }
    // console.log(newVal);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  });

  return {
    cartItems,
    addItem,
    removeItem,
    increaseOneQuantity,
    decreaseOneQuantity,
    clearCart,
    totalCartItems,
    totalCartPrice,
    isEmpty,
    direction,
    cartOpened,
    addingToCart
  };
}
