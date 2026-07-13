<script setup>
import HomeHeader from '@/components/segments/HomeHeader.vue';
import TheCart from '@/components/segments/TheCart.vue';
import TheFooter from '@/components/segments/TheFooter.vue';
import TheNavbar from '@/components/segments/TheNavbar.vue';
import { useCart } from '@/composables/useCart';
import { useHomeHeader } from '@/composables/useHomeHeader';
import { CartOutline, ChevronForward, CloseOutline } from '@vicons/ionicons5';
import { NButton, NDrawer, NDrawerContent, NIcon } from 'naive-ui';
import { onMounted, shallowRef } from 'vue';
import { RouterView } from 'vue-router';

// const props = defineProps({
//   sidebarMinimised: {
//     type: Boolean,
//     default: false,
//   },
// })

const { totalCartItems, totalCartPrice, direction, cartOpened, addingToCart } = useCart();

const { storeDetailsMachine } = useHomeHeader();

onMounted(async () => {
  await storeDetailsMachine.start();
  if (storeDetailsMachine.response.value) {
    document.body.style.setProperty(
      '--primary-color',
      storeDetailsMachine.response.value.brandColor || '#000000'
    );
  }
});

const vw = innerWidth;
</script>
<template>
  <div class="home-layout">
    <div class="hl__top">
      <HomeHeader></HomeHeader>

      <!-- <h1 class="hl__logo">VONO = Vue + Hono</h1> -->
    </div>
    <div class="hl__middle">
      <TheNavbar class="flex-1" v-if="vw > 700"></TheNavbar>
    </div>
    <div class="hl__bottom">
      <RouterView></RouterView>

      <div class="hl__footer text-center">
        <!-- <p>
          Copyright &copy; {{ storeDetailsMachine.response.value?.name }}, 2026. All rights
          reserved!
        </p> -->
        <TheFooter></TheFooter>
      </div>
    </div>

    <NDrawer v-model:show="cartOpened" :width="500" placement="right" :style="{ maxWidth: '100%' }">
      <NDrawerContent title="Cart Items">
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="flex items-center gap-2">
              <NIcon>
                <CartOutline />
              </NIcon>
              Cart Items (<transition
                enter-active-class="transition duration-300"
                leave-active-class="transition duration-300"
                :enter-from-class="
                  direction === 'down' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
                "
                :leave-to-class="
                  direction === 'down' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
                "
                mode="out-in"
                ><span :key="totalCartItems" class="inline-block">
                  {{ totalCartItems }}
                </span></transition
              >)
            </h4>
            <NButton @click="cartOpened = false" type="error" quaternary>
              <NIcon>
                <CloseOutline />
              </NIcon>
            </NButton>
          </div>
        </template>

        <TheCart></TheCart>
        <div class="hl__close-cart" @click="cartOpened = false">
          <NIcon>
            <ChevronForward></ChevronForward>
          </NIcon>
        </div>
      </NDrawerContent>
    </NDrawer>
    <div
      class="hl__open-cart"
      :class="{ 'hl__open-cart--adding': addingToCart }"
      @click="cartOpened = true"
    >
      <div class="text-lg hl__open-cart-header">
        <div class="text-sm">
          <transition
            enter-active-class="transition duration-300"
            leave-active-class="transition duration-300"
            :enter-from-class="
              direction === 'up' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
            "
            :leave-to-class="
              direction === 'up' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
            "
            mode="out-in"
          >
            <span :key="totalCartItems" class="inline-block">
              {{ totalCartItems }}
            </span>
          </transition>
        </div>

        <NIcon>
          <CartOutline />
        </NIcon>
      </div>

      <!-- <div class="text-orange-500 px-2 py-1">
        ৳
        <transition
          enter-active-class="transition duration-300"
          leave-active-class="transition duration-300"
          :enter-from-class="
            direction === 'up' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
          "
          :leave-to-class="
            direction === 'up' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
          "
          mode="out-in"
        >
          <span :key="totalCartPrice" class="inline-block"> {{ totalCartPrice }} </span>
        </transition>
      </div> -->
    </div>
  </div>
</template>

<style>
.home-layout {
  /* display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column; */
}

.hl__top {
  min-height: 22px;
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0; */
  z-index: 1111;
  background-color: #fff;
}

.hl__middle {
  position: sticky;
  top: 0;
  z-index: 1111;
}

.hl__bottom {
  /* height: 0;
  flex: 1; */
  /* background-color: #ffffff; */
  overflow-y: auto;
  /* margin-top: 59px; */
}

.hl__footer {
  /* background-color: #353535;
  color: #fff;
  padding: 9px; */
}

.hl__logo {
  font-size: 20px;
  font-weight: bold;
  color: #007c3e;
}

@media only screen and (max-width: 700px) {
  .hl__top {
    display: block;
  }
}

.hl__open-cart {
  position: fixed;
  top: 45%;
  right: 0;
  /* padding: 2px 11px; */
  transition: all 0.3s ease-in-out;
  text-align: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px 0 0 5px;
  background-color: #fff;
}

.hl__open-cart:hover,
.hl__open-cart--adding {
  /* background-color: #f5f5f5; */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.hl__open-cart--adding {
  transform: scale(1.5);
  right: 5px;
}

.hl__open-cart-header {
  background-color: var(--primary-400);
  padding: 2px 7px;
  border-radius: 5px 0 0 5px;
}

.hl__close-cart {
  position: absolute;
  top: 45%;
  left: -28px;
  z-index: 9999999;
  padding: 16px 7px;
  background: #fff;
  cursor: pointer;
  border-radius: 5px 0 0 5px;
}

.hl__close-cart:hover {
  font-weight: bold;
  color: red;
}
</style>
