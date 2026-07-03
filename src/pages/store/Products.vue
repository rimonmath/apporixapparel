<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError, getUploadedUrl } from '@/utils/functions';
import { addProductSchema } from '@/utils/schemas';
import type { SuccessResponse, Product } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon
} from 'naive-ui';
import { onMounted, ref, shallowReactive, shallowRef, watch } from 'vue';
import { EllipsisVerticalOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import EditProduct from '@/components/segments/EditProduct.vue';
import { API_DOMAIN } from '@/utils/data';
import { useStoreInfo } from '@/composables/useStoreInfo';

const message = useMessage();

const { subDomain } = useStoreInfo();

const router = useRouter();
const route = useRoute();

const createMachine = useCreate<SuccessResponse>(`/store/${subDomain.value}/products`, true);
const readMachine = useRead<Product[], true>(`/store/${subDomain.value}/products`, true, {
  route,
  router,
  extra: ''
});
const deleteMachine = useDelete<SuccessResponse>(true);

const updateDialog = shallowRef(false);

const addFormData = shallowReactive({
  title: ''
});

const resetForm = () => {
  addFormData.title = '';
};

const addItem = async () => {
  await createMachine.start(addFormData);
  if (createMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
  } else {
    message.success(createMachine.response.value?.message!);
    readMachine.start();
    createMachine.dialog.value = false;
    resetForm();
    selectedItem.value = { id: createMachine.response.value?.id };
    updateDialog.value = true;
  }
};

const selectedItem: Record<string, any> = ref({});

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit Product') {
    selectedItem.value = { ...item };
    updateDialog.value = true;
  } else if (key === 'Delete') {
    selectedItem.value = { ...item };
    deleteMachine.dialog.value = true;
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/${subDomain.value}/products/${selectedItem.value.id}`);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
    readMachine.start();
  }
};

watch(updateDialog, (newValue, oldValue) => {
  if (oldValue && !newValue) {
    readMachine.start();
  }
});

onMounted(() => {
  readMachine.start();
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center">
      <h1 class="my-4">All Products List</h1>
      <div class="mb-2 md:mb-0">
        <n-input clearable placeholder="Search by name..." v-model:value="readMachine.s.value">
          <!-- <template #suffix> Search </template> -->
        </n-input>
      </div>
      <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton>
    </div>

    <NEmpty
      class="mt-10"
      description="Nothing found!"
      v-if="!readMachine.loading.value && !readMachine.response.value?.length"
    >
    </NEmpty>

    <div class="table-container">
      <n-table
        :bordered="false"
        :single-line="false"
        class="mt-2"
        size="small"
        v-if="readMachine.response.value?.length"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Categories</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in readMachine.response.value" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <div class="flex items-center">
                <img
                  class="max-h-[50px]"
                  v-if="item.images?.length"
                  :src="getUploadedUrl(item.images[0].url)"
                  alt="Image"
                />
                <img class="max-h-[50px]" v-else src="/img/product-image.png" alt="Image" />
                <span class="ml-2">
                  {{ item.title }}
                </span>
              </div>
            </td>
            <td>{{ item.categories.map((pc) => pc.category.name).join(', ') }}</td>

            <td>{{ item.status }}</td>
            <td>
              <n-dropdown
                trigger="click"
                placement="bottom-end"
                :show-arrow="true"
                :options="[
                  {
                    label: item.title,
                    key: item.title,
                    disabled: true
                  },
                  {
                    label: 'Edit Product',
                    key: 'Edit Product'
                  },

                  {
                    label: 'Delete',
                    key: 'Delete'
                  }
                ]"
                @select="
                  (key: string) => {
                    handleActionClick(key, item);
                  }
                "
              >
                <n-button quaternary>
                  <NIcon>
                    <EllipsisVerticalOutline></EllipsisVerticalOutline>
                  </NIcon>
                </n-button>
              </n-dropdown>
            </td>
          </tr>
        </tbody>
      </n-table>

      <div class="my-4 p-2 bg-white flex justify-center" v-if="readMachine.response.value?.length">
        <NPagination
          v-model:page="readMachine.page.value"
          v-model:page-size="readMachine.pageSize.value"
          :page-count="readMachine.pageCount.value"
          show-size-picker
          :page-sizes="[1, 2, 5, 10, 20, 30, 40]"
          size="medium"
        />
      </div>
    </div>

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new product"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addProductSchema">
        <template #default="{ errors }">
          <div class="grid grid-cols-1 gap-6">
            <div>
              <AFormInput label="Title" name="title" :errors="errors" :formData="addFormData" />

              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="createMachine.loading.value"
              >
                Add Product
              </NButton>
            </div>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateDialog"
      class="custom-modal"
      preset="card"
      title="Edit This product"
      :bordered="false"
      :style="{ width: '100%', height: '100vh', backgroundColor: '#f8f8f8', overflowY: 'auto' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <EditProduct :productId="selectedItem.id"></EditProduct>
    </NModal>

    <NModal
      v-model:show="deleteMachine.dialog.value"
      preset="card"
      title="Are you sure?"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <div class="pb-4">
        Do you really want to delete {{ selectedItem.title }}?
        <br />
        This can not be undone.
        <br />
        <div class="flex justify-between mt-4">
          <NButton type="error" @click="deleteItem">Yes</NButton>
          <NButton type="primary" @click="deleteMachine.dialog.value = false">No</NButton>
        </div>
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
