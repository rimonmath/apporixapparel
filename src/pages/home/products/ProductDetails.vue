<script setup lang="ts">
import XLogo from '@/components/icons/XLogo.vue';
import SmartLink from '@/components/others/SmartLink.vue';
import { useCart } from '@/composables/useCart';
import { useRead } from '@/composables/useRead';
import {
  copyToClipboard,
  fixWhatsappNumber,
  getUploadedUrl,
  replaceSpaces
} from '@/utils/functions';
import type { Product } from '@/utils/types';
import {
  CallOutline,
  CopyOutline,
  LogoWhatsapp,
  PricetagOutline,
  SendOutline,
  PersonOutline,
  LogoFacebook,
  LogoLinkedin,
  ShareSocialOutline
} from '@vicons/ionicons5';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NCarousel,
  NCarouselItem,
  NEmpty,
  NIcon,
  NImageGroup,
  NInputNumber,
  NPopover,
  useMessage,
  type ImageRenderToolbarProps
} from 'naive-ui';
import { computed, h, onMounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';

const message = useMessage();
const route = useRoute();

const ProductsMachine = useRead<Product>(`/public/products/details/${route.params.productId}`);

const pricingMap = computed(() => {
  if (!ProductsMachine.response.value) {
    return {};
  }
  return Object.fromEntries(
    ProductsMachine.response.value?.pricings.map((pricing) => [pricing.variation, pricing])
  );
});

const selectedVariant = ref<Record<string, string>>({});
const selectedVariantString = computed(() => {
  return (
    Object.entries(selectedVariant.value)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}:${value}`)
      .join('__') || 'Default'
  );
});

function setSelectedVariant(variantName: string, variantValue: string) {
  selectedVariant.value[variantName] = variantValue;
  // console.log(selectedVariant.value);
}

onMounted(async () => {
  await ProductsMachine.start();

  ProductsMachine.response.value?.variants.forEach((variant) => {
    selectedVariant.value[variant.name] = '';
  });
  document.title = ProductsMachine.response.value?.title + ' | Khudroshop';
});

const imageDialog = shallowRef(false);
const currentImageIndex = shallowRef(0);

const imageUrls = computed(() => {
  return ProductsMachine.response.value?.images.map((img) => getUploadedUrl(img.url));
});

const handleUpdateCurrent = () => {};

function renderToolbar({ nodes }: ImageRenderToolbarProps) {
  return h(
    'div',
    {
      style: {
        minWidth: '200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: '11px'
      }
    },
    [nodes.prev, nodes.zoomIn, nodes.zoomOut, nodes.next]
  );
}

const showPhoneNumber = shallowRef(false);
const showWhatsappNumber = shallowRef(false);

/* ======================== Share =================================*/
const currentUrl = window.location.href;
const title = document.title || 'Check this out!';

const facebookShareUrl = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
);

const xShareUrl = computed(
  () =>
    `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`
);

const whatsappShareUrl = computed(
  () => `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + currentUrl)}`
);

const linkedinShareUrl = computed(
  () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
);

const canShare = shallowRef(!!navigator.share);

const shareNow = async () => {
  try {
    await navigator.share({
      title,
      text: 'Check out this product!',
      url: currentUrl
    });
  } catch (err) {
    console.log('Share cancelled or unsupported:', err);
  }
};

const sortedCategories = computed(() => {
  return ProductsMachine.response.value?.categories.sort((a, b) => a.category.id - b.category.id);
});

const addToCartQuantity = shallowRef(1);

const { addItem, cartOpened } = useCart();

function addToCart() {
  console.log('adding to cart...');
  if (!ProductsMachine.response.value) {
    return;
  }

  if (!selectedVariantString.value) {
    message.error('Please select a variant');
    return;
  }

  //   type CartItem = {
  //   productId: number;
  //   variation: string;
  //   quantity: number;
  //   pricePerUnit: number;
  // };

  addItem({
    productId: ProductsMachine.response.value?.id,
    variation: selectedVariantString.value,
    quantity: addToCartQuantity.value,
    pricePerUnit: Number(pricingMap.value[selectedVariantString.value].salePrice),
    productTitle: ProductsMachine.response.value?.title,
    productImage:
      pricingMap.value[selectedVariantString.value]?.image ||
      ProductsMachine.response.value?.images[0].url
  });

  // message.success('Product added to cart successfully!');
  // cartOpened.value = true;
}

watch(selectedVariantString, () => {
  setCurrentImageIndex();
});

const setCurrentImageIndex = () => {
  if (pricingMap.value[selectedVariantString.value]) {
    // console.log(pricingMap.value[selectedVariantString.value]);

    const imageIndex = ProductsMachine.response.value?.images.findIndex(
      (img) => img.url === pricingMap.value[selectedVariantString.value].image
    );

    if (imageIndex !== undefined) {
      currentImageIndex.value = imageIndex;
    }
  }
};

const shareReferralLink = async () => {
  if (!canShare.value) return;

  try {
    await navigator.share({
      title: 'Khudroshop',
      text: 'Check out this amazing website!',
      url: currentUrl
    });
  } catch (err) {
    console.log('Share cancelled or unsupported:', err);
  }
};

// selectedVariantString
</script>

<template>
  <div class="bg-white">
    <div class="container">
      <!-- {{ ProductsMachine.response.value?.pricings }}
      <hr />

      {{ selectedVariantString }}
      <hr />
      {{ pricingMap[selectedVariantString] }} -->

      <div class="grid grid-cols-[1fr] md:grid-cols-[1fr_4fr] gap-6">
        <div class="product-left flex md:block">
          <div v-for="(img, i) in ProductsMachine.response.value?.images" class="text-center">
            <img
              class="inline-block cursor-pointer max-h-[50px] md: md:max-h-[90px] my-4 mx-2"
              :class="{ 'active-image': i === currentImageIndex }"
              :src="getUploadedUrl(img.url)"
              @click="
                currentImageIndex = i;
                imageDialog = true;
              "
            />
          </div>
        </div>
        <div class="product-right p-0 md:p-2">
          <div v-if="ProductsMachine.loading.value"></div>
          <NEmpty
            v-else-if="!ProductsMachine.response.value"
            class="my-20"
            description="Product not found"
          >
          </NEmpty>
          <div v-else>
            <div class="my-2">
              <NCard size="small">
                <NBreadcrumb separator=">">
                  <NBreadcrumbItem>
                    <SmartLink to="/">Home</SmartLink>
                  </NBreadcrumbItem>
                  <NBreadcrumbItem v-for="category in sortedCategories">
                    <SmartLink
                      :to="`/categories/${category.categoryId}/${replaceSpaces(category.category.name)}`"
                    >
                      {{ category.category.name }}
                    </SmartLink>
                  </NBreadcrumbItem>
                </NBreadcrumb>
              </NCard>
            </div>
            <div class="mt-4 flex justify-between items-center gap-2">
              <h4>
                {{ ProductsMachine.response.value?.title }}
              </h4>
              <NButton
                size="tiny"
                type="primary"
                ghost
                title="Share Referral Link"
                @click="shareReferralLink"
                v-if="canShare"
              >
                <NIcon>
                  <ShareSocialOutline />
                </NIcon>
              </NButton>
              <template v-else>
                <NPopover trigger="click" raw :show-arrow="false">
                  <template #trigger>
                    <NButton size="tiny" type="primary" ghost title="Share Referral Link">
                      <NIcon>
                        <ShareSocialOutline />
                      </NIcon>
                    </NButton>
                  </template>
                  <div
                    style="width: 200px; transform-origin: inherit; border-radius: 5px"
                    class="p-5 bg-white"
                  >
                    <div>Share on</div>
                    <a
                      :href="facebookShareUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                    >
                      <NIcon>
                        <LogoFacebook />
                      </NIcon>

                      Facebook
                    </a>

                    <a
                      :href="xShareUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                    >
                      <NIcon>
                        <XLogo />
                      </NIcon>

                      X (Twitter)
                    </a>
                    <a
                      :href="whatsappShareUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                    >
                      <NIcon>
                        <LogoWhatsapp />
                      </NIcon>

                      WhatsApp
                    </a>
                    <a
                      :href="linkedinShareUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                    >
                      <NIcon>
                        <LogoLinkedin />
                      </NIcon>

                      LinkedIn
                    </a>
                  </div>
                </NPopover>
              </template>
            </div>
            <hr class="my-4" />
            <div class="block md:flex gap-5 items-center">
              <div class="text-center md:text-left">
                <img
                  v-if="pricingMap[selectedVariantString]?.image"
                  class="inline-block max-h-50 border-1 border-blue-600 cursor-pointer"
                  :src="getUploadedUrl(pricingMap[selectedVariantString]?.image!)"
                  alt="Product image"
                  @click="
                    setCurrentImageIndex();
                    imageDialog = true;
                  "
                />
                <img
                  v-else-if="ProductsMachine.response.value?.images.length"
                  class="inline-block max-h-50 border-1 border-blue-600 cursor-pointer"
                  :src="
                    getUploadedUrl(ProductsMachine.response.value?.images[currentImageIndex].url)
                  "
                  alt="Product image"
                  @click="
                    setCurrentImageIndex();
                    imageDialog = true;
                  "
                />
              </div>
              <div class="flex-1">
                <table class="product-details-table mt-4">
                  <tbody>
                    <tr v-for="variant in ProductsMachine.response.value?.variants">
                      <th>Select {{ variant.name }}</th>
                      <td>:</td>
                      <td>
                        <div class="block md:flex items-center">
                          <div
                            v-for="variantValue in variant.values"
                            class="mx-2 my-2 md:my-0 cursor-pointer border px-2 hover:bg-blue-100"
                            :class="{
                              'bg-blue-500 hover:bg-blue-500 text-white':
                                selectedVariant && selectedVariant[variant.name] === variantValue
                            }"
                            @click="setSelectedVariant(variant.name, variantValue)"
                          >
                            {{ variantValue }}
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th>Price</th>
                      <td>:</td>
                      <td class="text-lg text-orange-500 font-semibold">
                        <span v-if="pricingMap[selectedVariantString]">
                          TK. {{ pricingMap[selectedVariantString].salePrice }}
                        </span>
                        <span v-else>Select variants to see price</span>
                      </td>
                    </tr>

                    <tr>
                      <th>
                        <div class="flex items-center">Available</div>
                      </th>
                      <td>:</td>
                      <td class="text-lg">
                        <div class="flex itemc-center gao-2">
                          <span>
                            {{
                              pricingMap[selectedVariantString]
                                ? pricingMap[selectedVariantString].quantity
                                : 'Select variants to see availability'
                            }}
                          </span>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th>Add To Cart</th>
                      <td>:</td>

                      <td>
                        <div class="flex items-center space-x-2">
                          <NInputNumber v-model:value="addToCartQuantity" size="small" />
                          <NButton
                            type="success"
                            size="small"
                            :disabled="
                              addToCartQuantity === 0 ||
                              !pricingMap[selectedVariantString] ||
                              addToCartQuantity > pricingMap[selectedVariantString].quantity
                            "
                            @click="addToCart"
                          >
                            Add To Cart
                          </NButton>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <hr class="my-4" />

            <h4 class="mb-4">Product Description</h4>
            <div
              v-html="ProductsMachine.response.value?.description"
              class="rich-text min-h-[800px]"
            ></div>
          </div>
        </div>
      </div>

      <NImageGroup
        v-model:show="imageDialog"
        v-model:current="currentImageIndex"
        :src-list="imageUrls"
        @update:show="() => {}"
        @update:current="handleUpdateCurrent"
        :render-toolbar="renderToolbar"
      />
    </div>
  </div>
</template>

<style>
.product-left {
  background-image: linear-gradient(to right, #fff, var(--primary-5));
}

.product-right {
  min-height: 90vh;
  /* padding: 33px; */
  /* --start-color: #f9f9f9; */
  /* background-image: url('/img/bgs/banner-bg.jpg'); */
  /* background-size: 100% auto; */
  /* background-image: linear-gradient(to right, var(--start-color), #fff, var(--start-color)); */
}

.product-details-table th,
.product-details-table td {
  padding: 9px 5px;
}

.product-details-table th {
  text-align: left;
}

.active-image {
  border: 1px solid rgb(255, 123, 0);
}

.n-breadcrumb {
  white-space: wrap;
}
</style>
