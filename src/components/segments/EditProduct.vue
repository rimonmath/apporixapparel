<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useUpdate } from '@/composables/useUpdate';
import {
  addProductVariantSchema,
  editProductSchema,
  editProductVariantSchema
} from '@/utils/schemas';
import type {
  Attribute,
  Category,
  Product,
  ProductImage,
  SKUResult,
  SuccessResponse,
  Variant,
  VariantCombination
} from '@/utils/types';
import {
  computed,
  h,
  nextTick,
  onMounted,
  reactive,
  ref,
  shallowReactive,
  shallowRef,
  watch
} from 'vue';
import AForm from '../form/AForm.vue';
import AFormInput from '../form/AFormInput.vue';
import AFormSelect from '../form/AFormSelect.vue';
import {
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NCollapse,
  NCollapseItem,
  NIcon,
  NImageGroup,
  NInput,
  NInputNumber,
  NModal,
  NPopover,
  NSelect,
  NSpace,
  NTable,
  NTabPane,
  NTabs,
  useMessage,
  type ImageRenderToolbarProps
} from 'naive-ui';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { beautifyError, cartesian, getUploadedUrl } from '@/utils/functions';
import AFormInputNumber from '../form/AFormInputNumber.vue';
import {
  CopyOutline,
  CreateOutline,
  EllipseOutline,
  EllipsisVerticalOutline,
  RadioButtonOffOutline,
  TrashOutline
} from '@vicons/ionicons5';
import { useCreateFormData } from '@/composables/useCreateFormData';
import { API_DOMAIN } from '@/utils/data';
import { useDelete } from '@/composables/useDelete';
import { useCreate } from '@/composables/useCreate';
import { useStoreInfo } from '@/composables/useStoreInfo';

interface Props {
  productId: number;
}

const props = withDefaults(defineProps<Props>(), {
  productId: 0
});

const { subDomain } = useStoreInfo();

const message = useMessage();

const product = ref<Product | null>(null);

const readMachine = useRead<Product, true>(
  `/store/${subDomain.value}/products/${props.productId}`,
  true
);
const readCategoriesMachine = useRead<Category[], true>(
  `/store/${subDomain.value}/categories`,
  true
);
const updateProductMachine = useUpdate<SuccessResponse>(true);

const createImageMachine = useCreateFormData<SuccessResponse>(
  `/store/${subDomain.value}/products/${props.productId}/add-photo`,
  true
);
const createVariantMachine = useCreate<SuccessResponse>(
  `/store/${subDomain.value}/products/${props.productId}/add-variant`,
  true
);

const createMachine = useCreate<SuccessResponse>(`/store/${subDomain.value}/products`, true);

const deletePhotoMachine = useDelete<SuccessResponse>(true);

const saveChanges = async () => {
  await updateProductMachine.start(
    `/store/${subDomain.value}/products/${props.productId}`,
    readMachine.response.value!
  );
  if (updateProductMachine.error.value) {
    message.error(beautifyError(updateProductMachine.error.value));
  } else {
    message.success(updateProductMachine.response.value?.message!);
  }
};

const categoriesMap = computed(
  () =>
    Object.fromEntries(
      (readCategoriesMachine.response.value ?? []).map((c) => [c.id, c])
    ) as Record<number, Category>
);

const categories = computed(() => getChilds(readCategoriesMachine.response.value!, 0));

function getChilds(categories: Category[], parentId: number): Category[] {
  if (!categories) {
    return [];
  }
  return categories
    .filter((category) => category.parentId === parentId)
    .map((item) => ({ ...item, childs: getChilds(categories, item.id) }))
    .sort((a, b) => a.id - b.id);
}

const categoriesDialog = shallowRef(false);

function handleCategoryClick(categoryIds: number[]) {
  // console.log(parentCategoryIds);
  nextTick(() => {
    if (readMachine.response.value?.categoryIds.includes(categoryIds[0])) {
      categoryIds.forEach((categoryId) => {
        if (!readMachine.response.value?.categoryIds.includes(categoryId)) {
          readMachine.response.value?.categoryIds.push(categoryId);
        }
      });
    }
  });
}

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  await createImageMachine.start({ photo: file });

  if (createImageMachine.error.value) {
    message.error(beautifyError(createImageMachine.error.value));
  } else {
    message.success(createImageMachine.response.value?.message!);
    getProductDetails();
  }
};

const deleteProductPhoto = async (photo: ProductImage) => {
  // console.log(selectedItem.value);
  await deletePhotoMachine.start(
    `/store/${subDomain.value}/products/${props.productId}/delete-photo/${photo.id}`
  );
  if (deletePhotoMachine.error.value) {
    message.error(beautifyError(deletePhotoMachine.error.value));
  } else {
    message.success(deletePhotoMachine.response.value?.message!);
    deletePhotoMachine.dialog.value = false;
    getProductDetails();
  }
};

const imageDialog = shallowRef(false);
const currentImageIndex = shallowRef(0);

const imageUrls = computed(() => {
  return readMachine.response.value?.images.map((img) => API_DOMAIN + img.url);
});

const handleUpdateCurrent = () => {};

//===================== Variant tasks =====================
const existingVariantsMap = computed(() =>
  Object.fromEntries(
    (readMachine.response.value?.variants ?? []).map((variant) => [variant.name, variant])
  )
);

const readAttributesMachine = useRead<Attribute[], true>(
  `/store/${subDomain.value}/attributes`,
  true
);

const attributes = computed(() => {
  return readAttributesMachine.response.value
    ?.map((item) => ({
      label: item.name,
      value: item.name
    }))
    .filter((attribute) => !existingVariantsMap.value[attribute.label]);
});

const attributeValues = computed(() => {
  const values: Record<string, string[]> = {};
  readAttributesMachine.response.value?.forEach((item) => {
    values[item.name] = item.attributeValues.map((v) => v.value);
  });

  return values;
});

const addVariantFormData = reactive({
  name: '' as string,
  values: [] as string[]
});

watch(
  () => addVariantFormData.name,
  (newValue, oldValue) => {
    if (existingVariantsMap.value[newValue]) {
      message.error('This variant already exists!');
      return;
    }

    addVariantFormData.values = attributeValues.value[newValue] || [];
  }
);

const addVariant = async () => {
  // console.log(addVariantFormData);
  await createVariantMachine.start(addVariantFormData);
  if (createVariantMachine.error.value) {
    message.error(beautifyError(createVariantMachine.error.value));
  } else {
    message.success(createVariantMachine.response.value?.message!);
    createVariantMachine.dialog.value = false;
    getProductDetails();
  }
};

const customVariantValue = shallowRef('');
const customValuePopover: any = ref(null);

function addCustomValue() {
  if (!customVariantValue.value || addVariantFormData.values.includes(customVariantValue.value)) {
    return;
  }

  addVariantFormData.values.push(customVariantValue.value);
  customVariantValue.value = '';
  customValuePopover.value?.setShow(false);
}

const deleteVariantMachine = useDelete<SuccessResponse>(true);

const deleteVariant = async (item: any) => {
  // console.log(selectedItem.value);
  await deleteVariantMachine.start(
    `/store/${subDomain.value}/products/${props.productId}/delete-variant/${item.id}`
  );
  if (deleteVariantMachine.error.value) {
    message.error(beautifyError(deleteVariantMachine.error.value));
  } else {
    message.success(deleteVariantMachine.response.value?.message!);
    deleteVariantMachine.dialog.value = false;
    getProductDetails();
  }
};

const updateVariantMachine = useUpdate<SuccessResponse>(true);

const updateVariantFormData = ref({
  id: 0 as number,
  name: '' as string,
  values: [] as string[]
});

const customValuePopoverForEditing: any = ref(null);

function addCustomValueForEditing() {
  if (
    !customVariantValue.value ||
    updateVariantFormData.value.values.includes(customVariantValue.value)
  ) {
    return;
  }
  updateVariantFormData.value.values.push(customVariantValue.value);
  customVariantValue.value = '';
  customValuePopoverForEditing.value?.setShow(false);
}

async function updateVariant() {
  await updateVariantMachine.start(
    `/store/${subDomain.value}/products/${props.productId}/edit-variant/${updateVariantFormData.value.id}`,
    updateVariantFormData.value
  );
  if (updateVariantMachine.error.value) {
    message.error(beautifyError(updateVariantMachine.error.value));
  } else {
    message.success(updateVariantMachine.response.value?.message!);
    updateVariantMachine.dialog.value = false;
    getProductDetails();
  }
}

///======================== Variant generation ====================

const SKUs = computed(() => {
  const variants = readMachine.response.value?.variants;

  if (!variants || variants.length === 0) {
    return [{ sku: 'Default', variant: {} }];
  }

  const sortedVariants = [...variants].sort((a, b) => a.name.localeCompare(b.name));

  // build variant combinations
  const combinations = cartesian(sortedVariants);

  // format into final structure

  const finalVariants = combinations.map((variant): SKUResult => {
    const sku = sortedVariants.map((v) => `${v.name}:${variant[v.name]}`).join('__');

    return { sku, variant };
  });

  finalVariants.unshift({ sku: 'Default', variant: {} });

  return finalVariants;
});

const pricingMap: Record<string, any> = ref({});
const pricingModel: Record<string, any> = ref({});

async function getProductDetails() {
  // readMachine.start();
  await readMachine.start();
  pricingMap.value = {};
  readMachine.response.value?.pricings.forEach((pricing) => {
    pricingMap.value[pricing.variation] = pricing;
  });

  // console.log(pricingMap);
  pricingModel.value = {};

  nextTick(() => {
    SKUs.value.forEach((sku) => {
      if (pricingMap.value[sku.sku]) {
        pricingModel.value[sku.sku] = pricingMap.value[sku.sku];
      } else {
        pricingModel.value[sku.sku] = {
          productId: props.productId,
          variation: sku.sku,
          buyPrice: '0',
          regularPrice: '0',
          salePrice: '0',
          shippingRate: '0',
          weight: '0',
          quantity: 0,
          image: '',
          new: true
        };
      }
    });

    // console.log(pricingModel.value);
  });
}

const savePricingMachine = useUpdate<SuccessResponse>(true);

async function savePricing() {
  console.log(pricingModel.value);
  await savePricingMachine.start(
    `/store/${subDomain.value}/products/${props.productId}/save-pricing`,
    pricingModel.value
  );

  if (savePricingMachine.error.value) {
    message.error(beautifyError(savePricingMachine.error.value));
  } else {
    message.success(savePricingMachine.response.value?.message!);
    getProductDetails();
  }
}

const deletePricingMachine = useDelete<SuccessResponse>(true);

async function deletePricing(pricing: any) {
  // console.log(selectedItem.value);
  await deletePricingMachine.start(
    `/store/${subDomain.value}/products/${props.productId}/delete-pricing/${pricing.variation}`
  );
  if (deletePricingMachine.error.value) {
    message.error(beautifyError(deletePricingMachine.error.value));
  } else {
    message.success(deletePricingMachine.response.value?.message!);
    deletePricingMachine.dialog.value = false;
    getProductDetails();
  }
}

const obsoleteItems = computed(() => {
  const oi: any = [];
  Object.keys(pricingMap.value).forEach((key) => {
    if (!pricingModel.value[key]) {
      oi.push(pricingMap.value[key]);
    }
  });

  return oi;
  // (item, sku) in pricingMap
});

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

const variations = computed(() => {
  return SKUs.value.map((sku) => ({
    value: sku.sku,
    label: sku.sku.replace(/__/g, ', ').replace(/:/g, ': ')
  }));
});

onMounted(() => {
  getProductDetails();
  readCategoriesMachine.start();
  readAttributesMachine.start();
});

function updateVariationImage(e: Event, variation: any) {
  console.log(e, variation);
}

const combinationImageModal = shallowRef(false);
const selectedCombination = ref<any>({});
</script>

<template>
  <div>
    <div class="container mt-4">
      <!-- {{ variations }} -->
      <NTabs type="segment" animated>
        <NTabPane name="basic" tab="Basic Information">
          <AForm
            v-if="readMachine.response.value"
            @successSubmit="saveChanges"
            :formData="readMachine.response.value"
            :schema="editProductSchema"
            debug
          >
            <template #default="{ errors }">
              <div class="grid grid-cols-[1fr] md:grid-cols-[3fr_1fr] gap-10">
                <NCard>
                  <div style="min-height: 200px" class="mb-6">
                    <AFormInput label="Product Title" name="title" />

                    <div class="my-2">
                      <strong class="text-gray-600"> Description </strong>
                    </div>

                    <QuillEditor
                      v-model:content="readMachine.response.value.description"
                      theme="snow"
                      toolbar="essential"
                      contentType="html"
                      placeholder="Write description..."
                    />

                    <div class="mt-4 flex justify-between items-center">
                      <div class="text-md">
                        <strong> Categories :</strong> &nbsp;
                        <span
                          v-if="
                            readMachine.response.value && readMachine.response.value.categoryIds
                          "
                        >
                          {{
                            readMachine.response.value.categoryIds
                              .map((cid) => categoriesMap[cid]?.name)
                              .join(', ')
                          }}
                        </span>
                      </div>
                      <NButton @click="categoriesDialog = true" size="small"> Edit </NButton>
                    </div>
                    <hr class="mt-2 mb-3" />
                  </div>
                </NCard>

                <NCard>
                  <div class="mb-4">
                    <NCheckbox v-model:checked="readMachine.response.value.isFeatured">
                      Featured
                    </NCheckbox>

                    <NCheckbox v-model:checked="readMachine.response.value.isOnSale">
                      On Sale
                    </NCheckbox>
                  </div>

                  <AFormSelect
                    name="status"
                    v-model:value="readMachine.response.value.status"
                    label="Status"
                    :options="[
                      {
                        label: 'Draft',
                        value: 'Draft'
                      },
                      {
                        label: 'Published',
                        value: 'Published'
                      },
                      {
                        label: 'Archived',
                        value: 'Archived'
                      }
                    ]"
                  >
                  </AFormSelect>

                  <AFormInput
                    name="vendor"
                    v-model:value="readMachine.response.value.vendor"
                    label="Vendor"
                    placeholder="e.g. Apple"
                  >
                  </AFormInput>

                  <div class="mt-2">
                    <strong class="inline-block text-gray-600 mb-1">Tags</strong>
                    <NSelect
                      placeholder="Start typing"
                      v-model:value="readMachine.response.value.tags"
                      filterable
                      multiple
                      tag
                      :options="[]"
                    >
                      <template #empty> Type and press Enter to select </template>
                    </NSelect>
                  </div>

                  <NCollapse class="mt-6">
                    <NCollapseItem title="Advanced Properties" name="1">
                      <div>
                        <div>
                          <AFormInput
                            label="Meta Title"
                            placeholder="Meta Title"
                            name="metaTitle"
                          />
                        </div>
                        <div>
                          <AFormInput
                            label="Meta Description"
                            placeholder="Meta Title"
                            name="metaDescription"
                          />
                        </div>

                        <div>
                          <AFormInput label="Currency" placeholder="Currency" name="currency" />
                        </div>
                        <div>
                          <AFormInput label="Tax Rate" placeholder="Tax Rate (%)" name="taxRate" />
                        </div>
                      </div>
                    </NCollapseItem>
                  </NCollapse>
                </NCard>
              </div>

              <div class="flex justify-center my-5">
                <NButton
                  type="primary"
                  attr-type="submit"
                  class="login-btn"
                  :loading="updateProductMachine.loading.value"
                >
                  Save Changes
                </NButton>
              </div>
            </template>
          </AForm>
        </NTabPane>

        <NTabPane name="photo gallery" tab="Photo Gallery">
          <NCard>
            <div class="flex justify-between items-center">
              <h4>Product Gallery</h4>
              <input
                style="display: none"
                type="file"
                name="photo"
                id="photo"
                accept="image/*"
                @change="handleFileChange"
              />
              <NButton type="info">
                <label for="photo">Add Photo</label>
              </NButton>
            </div>
            <!-- {{ readMachine.response.value?.images }} -->

            <div class="mt-2">
              <NImageGroup
                v-model:show="imageDialog"
                v-model:current="currentImageIndex"
                :src-list="imageUrls"
                @update:show="() => {}"
                @update:current="handleUpdateCurrent"
                :render-toolbar="renderToolbar"
              />

              <div class="table-container my-5">
                <NTable>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>URL</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="image in readMachine.response.value?.images" :key="image.id">
                      <td>
                        <img class="max-h-[100px]" :src="getUploadedUrl(image.url)" alt="Image" />
                      </td>
                      <td>
                        <div class="flex items-center gap-2">
                          <span>
                            {{ getUploadedUrl(image.url) }}
                          </span>

                          <NButton size="tiny">
                            <NIcon>
                              <CopyOutline></CopyOutline>
                            </NIcon>
                          </NButton>
                        </div>
                      </td>
                      <td>
                        <NButton
                          @click="deleteProductPhoto(image)"
                          type="error"
                          :loading="deletePhotoMachine.loading.value"
                        >
                          <NIcon>
                            <TrashOutline></TrashOutline>
                          </NIcon>
                        </NButton>
                      </td>
                    </tr>
                  </tbody>
                </NTable>
              </div>
            </div>
          </NCard>
        </NTabPane>

        <NTabPane name="pricing" tab="Pricing & Inventory">
          <NCard>
            <div class="flex justify-between items-center">
              <h4>Product Variants</h4>

              <NButton
                @click="
                  addVariantFormData.name = '';
                  createVariantMachine.dialog.value = true;
                "
                type="info"
              >
                Add Variant
              </NButton>
            </div>

            <NTable
              :bordered="false"
              :single-line="false"
              class="mt-2"
              size="small"
              v-if="readMachine.response.value?.variants.length"
            >
              <thead>
                <tr>
                  <th>Variant Name</th>
                  <th>Variant Values</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="variant in readMachine.response.value?.variants">
                  <td>
                    <span class="text-lg">
                      {{ variant.name }}
                    </span>
                  </td>
                  <td>{{ variant.values.join(', ') }}</td>
                  <td>
                    <NSpace>
                      <NButton
                        secondary
                        ternary
                        size="small"
                        @click="
                          updateVariantFormData = variant;
                          updateVariantMachine.dialog.value = true;
                        "
                        type="info"
                      >
                        <NIcon>
                          <CreateOutline></CreateOutline>
                        </NIcon>
                        <!-- <span class="ml-1"> Edit</span> -->
                      </NButton>

                      <NButton
                        secondary
                        ternary
                        size="small"
                        @click="deleteVariant(variant)"
                        type="error"
                        :loading="deleteVariantMachine.loading.value"
                      >
                        <NIcon>
                          <TrashOutline></TrashOutline>
                        </NIcon>
                        <!-- <span class="ml-1"> Delete</span> -->
                      </NButton>
                    </NSpace>
                  </td>
                </tr>
              </tbody>
            </NTable>
          </NCard>

          <!-- {{ readMachine.response.value?.variants }} -->

          <hr class="my-4" />

          <NCard>
            <h4>Variant Combinations, Inventory & Pricing</h4>

            <NTable
              :bordered="false"
              :single-line="false"
              class="mt-4"
              size="small"
              v-if="SKUs.length"
            >
              <thead>
                <tr>
                  <th>Combination</th>
                  <th>Image</th>
                  <th>Buy Price</th>
                  <th>Regular Price</th>
                  <th>Sale Price</th>
                  <th>Shipping Rate</th>
                  <th>Weight(kg)</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(sku, i) in SKUs"
                  :key="sku.sku"
                  :class="{ 'disabled-variant': i === 0 && SKUs.length > 1 }"
                >
                  <template v-if="pricingModel[sku.sku]">
                    <td>
                      {{ sku.sku.replace(/__/g, ', ').replace(/:/g, ': ') }}
                    </td>
                    <td>
                      <div class="variant-image relative">
                        <img
                          class="max-h-40"
                          :src="getUploadedUrl(pricingModel[sku.sku].image)"
                          alt=""
                        />

                        <div
                          class="variant-image__edit"
                          @click="
                            selectedCombination = pricingModel[sku.sku];
                            combinationImageModal = true;
                          "
                        >
                          <!-- <NButton @click="" type="info"> -->
                          <NIcon>
                            <CreateOutline></CreateOutline>
                          </NIcon>
                          <!-- </NButton> -->
                        </div>

                        <!-- <img v-else class="max-h-40" :src="getUploadedUrl(readMachine.response.value?.images?.[0].url || '')" alt=""></img> -->
                      </div>
                    </td>
                    <td>
                      <NInput v-model:value="pricingModel[sku.sku].buyPrice" placeholder="Enter">
                      </NInput>
                    </td>
                    <td>
                      <NInput
                        v-model:value="pricingModel[sku.sku].regularPrice"
                        placeholder="Enter Price"
                      >
                      </NInput>
                    </td>
                    <td>
                      <NInput v-model:value="pricingModel[sku.sku].salePrice" placeholder="Enter">
                      </NInput>
                    </td>

                    <td>
                      <NInput
                        v-model:value="pricingModel[sku.sku].shippingRate"
                        placeholder="Enter "
                      >
                      </NInput>
                    </td>

                    <td>
                      <NInput v-model:value="pricingModel[sku.sku].weight" placeholder="Enter ">
                      </NInput>
                    </td>
                    <td>
                      <NInputNumber
                        v-model:value="pricingModel[sku.sku].quantity"
                        placeholder="Enter Quantity"
                      >
                      </NInputNumber>
                    </td>
                  </template>
                </tr>
              </tbody>
            </NTable>

            <NSpace class="mt-4" justify="end" v-if="SKUs.length">
              <NButton type="primary" @click="savePricing"> Save Pricing </NButton>
            </NSpace>

            <!-- {{ SKUs }} -->
          </NCard>

          <hr class="my-4" />

          <NCard style="opacity: 0.6" v-if="obsoleteItems.length">
            <h2 class="text-lg">Obsolete Items</h2>
            <NTable
              :bordered="false"
              :single-line="false"
              class="mt-4"
              size="small"
              v-if="SKUs.length"
            >
              <thead>
                <tr>
                  <th>Combination</th>
                  <th>Buy Price</th>
                  <th>Regular Price</th>
                  <th>Sale Price</th>
                  <th>Shipping Rate</th>
                  <th>Weight(kg)</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in obsoleteItems" :key="item.variation">
                  <td>
                    {{ item.variation.replace(/__/g, ', ').replace(/:/g, ': ') }}
                  </td>
                  <td>
                    {{ item.buyPrice }}
                  </td>
                  <td>
                    {{ item.regularPrice }}
                  </td>
                  <td>
                    {{ item.salePrice }}
                  </td>

                  <td>
                    {{ item.shippingRate }}
                  </td>

                  <td>
                    {{ item.weight }}
                  </td>
                  <td>
                    {{ item.quantity }}
                  </td>
                  <td>
                    <NButton
                      secondary
                      ternary
                      size="small"
                      @click="deletePricing(item)"
                      type="error"
                      :loading="deletePricingMachine.loading.value"
                    >
                      <NIcon>
                        <TrashOutline></TrashOutline>
                      </NIcon>
                      <!-- <span class="ml-1"> Delete</span> -->
                    </NButton>
                  </td>
                </tr>
              </tbody>
            </NTable>
          </NCard>
        </NTabPane>
      </NTabs>

      <NModal
        v-model:show="categoriesDialog"
        class="custom-card"
        preset="card"
        title="Select categories"
        :bordered="false"
        :style="{ width: '1280px' }"
      >
        <!-- {{ categoriesMap }} -->
        <NCheckboxGroup
          v-if="readMachine.response.value"
          v-model:value="readMachine.response.value.categoryIds"
        >
          <div class="flex flex-wrap">
            <div v-for="category in categories" class="mr-4">
              <NCheckbox :value="category.id">
                <div class="text-lg category-item">{{ category.name }}</div>
              </NCheckbox>
              <div class="ml-4 mt-2">
                <div
                  v-for="childCategory in category.childs"
                  class="category-item mb-2 text-md mb-4"
                >
                  <NCheckbox
                    :value="childCategory.id"
                    @click="handleCategoryClick([childCategory.id, category.id])"
                  >
                    <div class="category-item flex items-center text-[16px]">
                      {{ childCategory.name }}
                    </div>
                  </NCheckbox>

                  <div class="ml-4 mt-2">
                    <div
                      v-for="childChildCategory in childCategory.childs"
                      class="category-item mb-2 text-sm"
                    >
                      <NCheckbox
                        :value="childChildCategory.id"
                        @click="
                          handleCategoryClick([
                            childChildCategory.id,
                            childCategory.id,
                            category.id
                          ])
                        "
                      >
                        <div class="category-item flex items-center">
                          {{ childChildCategory.name }}
                        </div>
                      </NCheckbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NCheckboxGroup>

        <div class="mt-4 flex justify-center">
          <NButton type="primary" @click="categoriesDialog = false">Done</NButton>
        </div>
      </NModal>

      <NModal
        v-model:show="createVariantMachine.dialog.value"
        class="custom-card"
        preset="card"
        title="Add new variant"
        :bordered="false"
        :style="{ width: '500px' }"
        :mask-closable="false"
      >
        <!-- {{ categoriesMap }} -->
        <h4>Select Variant</h4>

        <AForm
          @successSubmit="addVariant"
          :formData="addVariantFormData"
          :schema="addProductVariantSchema"
        >
          <div class="grid grid-cols-1 gap-6 mt-2">
            <div>
              <!-- {{ addVariantFormData }} -->
              <NSelect
                placeholder="Enter variant name"
                name="name"
                v-model:value="addVariantFormData.name"
                filterable
                tag
                :options="attributes"
              >
                <template #empty> Type and press Enter to select </template>
              </NSelect>

              <hr class="mt-4" />
              <div class="min-h-[100px] mb-6">
                <div
                  class="mt-4 text-lg flex items-center justify-between"
                  v-if="addVariantFormData.name"
                >
                  <div class="">Variant values</div>

                  <NPopover
                    placement="bottom"
                    trigger="click"
                    @update:show="() => {}"
                    ref="customValuePopover"
                  >
                    <template #trigger>
                      <NButton size="small" type="info">Add custom value</NButton>
                    </template>
                    <div class="my-4">
                      <NSpace>
                        <NInput v-model:value="customVariantValue" />

                        <NButton @click="addCustomValue" type="primary">Add</NButton>
                      </NSpace>
                    </div>
                  </NPopover>
                </div>
                <hr class="my-4" />

                <div
                  v-for="(value, i) in addVariantFormData.values"
                  class="px-4 flex items-center justify-between my-2 hover:bg-gray-100"
                  :key="value"
                >
                  <span> {{ value }}</span>

                  <NButton
                    quaternary
                    size="small"
                    @click="addVariantFormData.values.splice(i, 1)"
                    type="error"
                  >
                    <NIcon>
                      <TrashOutline></TrashOutline>
                    </NIcon>
                  </NButton>
                </div>
              </div>

              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="createVariantMachine.loading.value"
              >
                Add Variant
              </NButton>
            </div>
          </div>
        </AForm>
      </NModal>

      <NModal
        v-model:show="updateVariantMachine.dialog.value"
        class="custom-card"
        preset="card"
        :title="`Update values for (${updateVariantFormData.name})`"
        :bordered="false"
        :style="{ width: '500px' }"
        :mask-closable="false"
      >
        <!-- {{ categoriesMap }} -->

        <AForm
          @successSubmit="updateVariant"
          :formData="updateVariantFormData"
          :schema="editProductVariantSchema"
        >
          <template #default="{ errors }">
            <div class="grid grid-cols-1 gap-6">
              <div>
                <div class="min-h-[100px] mb-6">
                  <div
                    class="mt-4 text-lg flex items-center justify-between"
                    v-if="updateVariantFormData.name"
                  >
                    <div class="">Variant values</div>

                    <NPopover
                      placement="bottom"
                      trigger="click"
                      @update:show="() => {}"
                      ref="customValuePopoverForEditing"
                    >
                      <template #trigger>
                        <NButton size="small" type="info">Add custom value</NButton>
                      </template>
                      <div class="my-4">
                        <NSpace>
                          <NInput v-model:value="customVariantValue" />

                          <NButton @click="addCustomValueForEditing" type="primary">Add</NButton>
                        </NSpace>
                      </div>
                    </NPopover>
                  </div>
                  <hr class="my-4" />

                  <div
                    v-for="(value, i) in updateVariantFormData.values"
                    class="px-4 flex items-center justify-between my-2 hover:bg-gray-100"
                    :key="value"
                  >
                    <span> {{ value }}</span>

                    <NButton
                      quaternary
                      size="small"
                      @click="updateVariantFormData.values.splice(i, 1)"
                      type="error"
                    >
                      <NIcon>
                        <TrashOutline></TrashOutline>
                      </NIcon>
                    </NButton>
                  </div>
                </div>

                <NButton
                  block
                  type="primary"
                  attr-type="submit"
                  class="login-btn"
                  :loading="updateVariantMachine.loading.value"
                >
                  Save Change
                </NButton>
              </div>
            </div>
          </template>
        </AForm>
      </NModal>
    </div>

    <NModal
      v-model:show="combinationImageModal"
      class="custom-card"
      preset="card"
      title="Select an image for this combination"
      :bordered="false"
      :style="{ width: '900px' }"
      :mask-closable="false"
    >
      <div class="p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            v-for="image in readMachine.response.value?.images"
            :key="image.id"
            @click="
              selectedCombination.image = image.url;
              combinationImageModal = false;
            "
            :class="{
              'border-2 border-primary': selectedCombination.image === image.url
            }"
          >
            <img class="max-h-40" :src="getUploadedUrl(image.url)" alt="" />
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style>
.ql-container {
  min-height: 400px;
}

.variant-image {
  margin: 0 9px;
  cursor: pointer;
}

.variant-image__edit {
  visibility: hidden;
  padding: 0 9px;
  cursor: pointer;
  color: #fff;
  position: absolute;
  top: -5px;
  right: -5px;
}

.variant-image__edit {
  visibility: hidden;
  padding: 0 9px;
  cursor: pointer;
  color: #fff;
  background-color: rgb(26, 136, 53);
}

.variant-image:hover .variant-image__edit {
  visibility: visible;
  color: #fff;
}

.variant-image:hover .variant-image__edit:hover {
  background-color: rgb(30, 163, 52);
}

.disabled-variant {
  opacity: 0.3;
  pointer-events: none;
}

.disabled-variant input {
  pointer-events: none;
}
</style>
