<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError, getUploadedUrl } from '@/utils/functions';
import { editCarouselSchema } from '@/utils/schemas';
import type { Carousel, SuccessResponse } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon,
  NTag,
  NSelect,
  NCheckbox
} from 'naive-ui';
import { onMounted, ref, shallowReactive } from 'vue';
import { EllipsisVerticalOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import AFormInputNumber from '@/components/form/AFormInputNumber.vue';
import { useCreateFormData } from '@/composables/useCreateFormData';
import { useStoreInfo } from '@/composables/useStoreInfo';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const { subDomain } = useStoreInfo();

const createMachine = useCreate<SuccessResponse>(`/store/${subDomain.value}/carousels`, true);
const readMachine = useRead<Carousel[], true>(`/store/${subDomain.value}/carousels`, true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  name: '',
  description: '',
  adsCount: 0,
  featuredAdsCount: 0,
  monthlyChargeInUsd: 0
});

const resetForm = () => {
  addFormData.name = '';
  addFormData.description = '';
  addFormData.adsCount = 1;
  addFormData.featuredAdsCount = 1;
};

const addItem = async () => {
  await createMachine.start(addFormData);
  if (createMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
  } else {
    message.success(createMachine.response.value?.message!);
    readMachineStart();
    createMachine.dialog.value = false;
    resetForm();
  }
};

const selectedItem: Record<string, any> = ref({});

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit carousel') {
    selectedItem.value = { ...item };
    updateMachine.dialog.value = true;
  } else if (key === 'Delete') {
    selectedItem.value = { ...item };
    deleteMachine.dialog.value = true;
  }
};

const saveChanges = async () => {
  // console.log(selectedItem.value);
  await updateMachine.start(
    `/store/${subDomain.value}/carousels/${selectedItem.value.id}`,
    selectedItem.value
  );
  if (updateMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
    readMachineStart();
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/${subDomain.value}/carousels/${selectedItem.value.id}`);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
    readMachineStart();
  }
};

function readMachineStart() {
  readMachine.start();
}

const createImageMachine = useCreateFormData<SuccessResponse>(
  `/store/${subDomain.value}/carousels`,
  true
);

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  await createImageMachine.start({ url: file });

  if (createImageMachine.error.value) {
    message.error(beautifyError(createImageMachine.error.value));
  } else {
    message.success(createImageMachine.response.value?.message!);
    readMachine.start();
  }
};

onMounted(() => {
  readMachineStart();
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center">
      <h2 class="my-4">All carousels</h2>

      <span class="text-sm text-orange-600"> Recommended size: 1280x550 </span>
      <label for="carousel">
        <input
          type="file"
          style="display: none"
          name="carousel"
          id="carousel"
          @change="handleFileChange"
        />

        <span
          class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 active:bg-green-800 transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add New Carousel
        </span>
      </label>
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
            <th>Name</th>
            <th>Description</th>
            <th>Link Text</th>
            <th>Link URL</th>
            <th>Active?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in readMachine.response.value" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <img class="h-[100px]" :src="getUploadedUrl(item.url)" alt="Image" />
            </td>
            <td>{{ item.description }}</td>
            <td>{{ item.linkText }}</td>
            <td>{{ item.linkUrl }}</td>
            <td>{{ item.isActive }}</td>

            <td>
              <n-dropdown
                trigger="click"
                placement="bottom-end"
                :show-arrow="true"
                :options="[
                  {
                    label: item.linkText,
                    key: item.linkText,
                    disabled: true
                  },
                  {
                    label: 'Edit carousel',
                    key: 'Edit carousel'
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
    </div>

    <NModal
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This carousel"
      :bordered="false"
      :style="{ width: '400px', maxWidth: '90%' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm
        @successSubmit="saveChanges"
        :formData="selectedItem"
        :schema="editCarouselSchema"
        debug
      >
        <div class="mb-4">
          <AFormInput label="Description" name="description" />
          <AFormInput label="Link Text" name="linkText" />
          <AFormInput label="Link URL" name="linkUrl" />
          <NCheckbox v-model:checked="selectedItem.isActive" label="Is Active" />
        </div>

        <NButton
          block
          type="primary"
          attr-type="submit"
          class="login-btn mt-8"
          :loading="updateMachine.loading.value"
        >
          Save Changes
        </NButton>
      </AForm>
    </NModal>

    <NModal
      v-model:show="deleteMachine.dialog.value"
      preset="card"
      title="Are you sure?"
      :bordered="false"
      :style="{ width: '400px', maxWidth: '90%' }"
    >
      <div class="pb-4">
        Do you really want to delete {{ selectedItem.name }}?
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
