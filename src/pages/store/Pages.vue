<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError } from '@/utils/functions';
import type { Page, SuccessResponse } from '@/utils/types';
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
  NCheckbox,
  NCard
} from 'naive-ui';
import { onMounted, ref, shallowReactive, watch } from 'vue';
import { EllipsisVerticalOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import AFormInputNumber from '@/components/form/AFormInputNumber.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { addEditPageSchema } from '@/utils/schemas';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const createMachine = useCreate<SuccessResponse>(`/store/pages`, true);
const readMachine = useRead<Page[], true>(`/store/pages`, true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  name: '',
  title: '',
  description: '',
  isPublished: true
});

const resetForm = () => {
  addFormData.name = '';
  addFormData.title = '';
  addFormData.description = '';
  addFormData.isPublished = true;
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
  if (key === 'Edit page') {
    selectedItem.value = { ...item };
    updateMachine.dialog.value = true;
  } else if (key === 'Delete') {
    selectedItem.value = { ...item };
    deleteMachine.dialog.value = true;
  }
};

const saveChanges = async () => {
  // console.log(selectedItem.value);
  await updateMachine.start(`/store/pages/${selectedItem.value.id}`, selectedItem.value);
  if (updateMachine.error.value) {
    message.error(beautifyError(updateMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
    readMachineStart();
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/pages/${selectedItem.value.id}`);
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

onMounted(() => {
  readMachineStart();
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center">
      <h2 class="my-4">All pages</h2>

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
            <th>Name</th>
            <th>Title</th>

            <th>Published?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in readMachine.response.value" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.isPublished }}</td>

            <td>
              <n-dropdown
                trigger="click"
                placement="bottom-end"
                :show-arrow="true"
                :options="[
                  {
                    label: item.name,
                    key: item.name,
                    disabled: true
                  },
                  {
                    label: 'Edit page',
                    key: 'Edit page'
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
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new page"
      :bordered="false"
      :style="{ width: '100%', height: '100vh', backgroundColor: '#f8f8f8', overflowY: 'auto' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addEditPageSchema" debug>
        <div class="container">
          <NCard>
            <div class="grid grid-cols-2 items-center gap-5">
              <AFormInput label="Name" name="name" />
              <NCheckbox v-model:checked="addFormData.isPublished">
                <strong>Published</strong>
              </NCheckbox>
            </div>
            <AFormInput label="Title" name="title" />

            <QuillEditor
              v-model:content="addFormData.description"
              theme="snow"
              toolbar="essential"
              contentType="html"
              placeholder="Write description..."
              class="min-h-[300px]"
            />
            <div class="mt-5">
              <NButton
                block
                type="primary"
                attr-type="submit"
                :loading="createMachine.loading.value"
              >
                Add page
              </NButton>
            </div>
          </NCard>
        </div>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This page"
      :bordered="false"
      :style="{ width: '100%', height: '100vh', backgroundColor: '#f8f8f8', overflowY: 'auto' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm
        @successSubmit="saveChanges"
        :formData="selectedItem"
        :schema="addEditPageSchema"
        debug
      >
        <div class="container">
          <NCard>
            <div class="grid grid-cols-2 items-center gap-5">
              <AFormInput label="Name" name="name" />
              <NCheckbox v-model:checked="selectedItem.isPublished">
                <strong>Published</strong>
              </NCheckbox>
            </div>
            <AFormInput label="Title" name="title" />

            <QuillEditor
              v-model:content="selectedItem.description"
              theme="snow"
              toolbar="essential"
              contentType="html"
              placeholder="Write description..."
              class="min-h-[300px]"
            />
            <div class="mt-5">
              <NButton
                block
                type="primary"
                attr-type="submit"
                :loading="createMachine.loading.value"
              >
                Save Changes
              </NButton>
            </div>
          </NCard>
        </div>
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
