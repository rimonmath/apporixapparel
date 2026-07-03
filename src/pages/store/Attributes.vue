<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { genders } from '@/utils/data';
import { beautifyError } from '@/utils/functions';
import { addAttributeSchema, addAttributeValueSchema, editAttributeSchema } from '@/utils/schemas';
import type { SuccessResponse, Attribute } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon,
  NCard
} from 'naive-ui';
import { onMounted, ref, shallowReactive } from 'vue';
import { EllipsisVerticalOutline, TrashOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import { useStoreInfo } from '@/composables/useStoreInfo';

const message = useMessage();
const { subDomain } = useStoreInfo();

const router = useRouter();
const route = useRoute();

const createMachine = useCreate<SuccessResponse>(`/store/${subDomain.value}/attributes`, true);
const createValueMachine = useCreate<SuccessResponse>('', true);
const readMachine = useRead<Attribute[], true>(`/store/${subDomain.value}/attributes`, true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);
const deleteValueMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  name: ''
});

const addValueFormData = shallowReactive({
  attributeId: 0,
  value: ''
});

const resetForm = () => {
  addFormData.name = '';
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
  }
};

const addValue = async () => {
  await createValueMachine.start(
    addValueFormData,
    `/store/${subDomain.value}/attributes/${addValueFormData.attributeId}/values`
  );
  if (createValueMachine.error.value) {
    message.error(beautifyError(createValueMachine.error.value));
  } else {
    message.success(createValueMachine.response.value?.message!);
    readMachine.start();
    createValueMachine.dialog.value = false;
  }
};

const selectedItem: Record<string, any> = ref({});

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit name') {
    selectedItem.value = { ...item };
    updateMachine.dialog.value = true;
  }

  if (key === 'Add a value') {
    addValueFormData.attributeId = item.id;
    addValueFormData.value = '';
    createValueMachine.dialog.value = true;
  }
  if (key === 'Delete') {
    selectedItem.value = { ...item };
    deleteMachine.dialog.value = true;
  }
};

const saveChanges = async () => {
  // console.log(selectedItem.value);
  await updateMachine.start(
    `/store/${subDomain.value}/attributes/${selectedItem.value.id}`,
    selectedItem.value
  );
  if (updateMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
    readMachine.start();
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/${subDomain.value}/attributes/${selectedItem.value.id}`);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
    readMachine.start();
  }
};

const deleteValue = async () => {
  // console.log(selectedItem.value);
  await deleteValueMachine.start(
    `/store/${subDomain.value}/attributes/0/values/${selectedItem.value.id}`
  );
  if (deleteValueMachine.error.value) {
    message.error(beautifyError(deleteValueMachine.error.value));
  } else {
    message.success(deleteValueMachine.response.value?.message!);
    deleteValueMachine.dialog.value = false;
    readMachine.start();
  }
};

onMounted(() => {
  readMachine.start();
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center">
      <h1 class="my-4 text-lg">All Attributes List</h1>

      <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton>
    </div>

    <hr class="my-4" />

    <div
      class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      v-if="readMachine.response.value?.length && !readMachine.loading.value"
    >
      <NCard class="mt-4" v-for="attribute in readMachine.response.value">
        <div class="flex justify-between items-center mb-2">
          <div class="text-lg">{{ attribute.name }}</div>
          <n-dropdown
            trigger="click"
            placement="bottom-end"
            :show-arrow="true"
            :options="[
              {
                label: attribute.name,
                key: attribute.name,
                disabled: true
              },
              {
                label: 'Edit name',
                key: 'Edit name'
              },
              {
                label: 'Add a value',
                key: 'Add a value'
              },

              {
                label: 'Delete',
                key: 'Delete'
              }
            ]"
            @select="
              (key: string) => {
                handleActionClick(key, attribute);
              }
            "
          >
            <NButton quaternary size="small">
              <NIcon>
                <EllipsisVerticalOutline></EllipsisVerticalOutline>
              </NIcon>
            </NButton>
          </n-dropdown>
        </div>

        <div
          v-for="value in attribute.attributeValues"
          class="mt-2 flex justify-between items-center pl-2 hover:bg-gray-50"
        >
          <span>- {{ value.value }}</span>
          <span>
            <NButton
              quaternary
              size="small"
              @click="
                selectedItem = value;
                deleteValueMachine.dialog.value = true;
              "
            >
              <NIcon>
                <TrashOutline></TrashOutline>
              </NIcon>
            </NButton>
          </span>
        </div>
      </NCard>
    </div>

    <NEmpty
      class="mt-10"
      description="Nothing found!"
      v-if="!readMachine.loading.value && !readMachine.response.value?.length"
    >
    </NEmpty>

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new attribute"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addAttributeSchema">
        <template #default="{ errors }">
          <div class="py-4">
            <AFormInput
              label="Attribute Name"
              placeholder="e.g. Size"
              name="name"
              :errors="errors"
              :formData="addFormData"
            />

            <div class="mt-4">
              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="createMachine.loading.value"
              >
                Add Attribute
              </NButton>
            </div>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="createValueMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add attribute value"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm
        @successSubmit="addValue"
        :formData="addValueFormData"
        :schema="addAttributeValueSchema"
      >
        <template #default="{ errors }">
          <div class="py-4">
            <AFormInput
              label="Value"
              placeholder="Enter a value"
              name="value"
              :errors="errors"
              :formData="addValueFormData"
            />

            <div class="mt-4">
              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="createValueMachine.loading.value"
              >
                Add Value
              </NButton>
            </div>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This attribute"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="saveChanges" :formData="selectedItem" :schema="editAttributeSchema">
        <template #default="{ errors }">
          <div>
            <!-- {{ selectedItem }} -->
            <AFormInput label="Full Name" name="name" :errors="errors" :formData="selectedItem" />

            <NButton
              block
              type="primary"
              attr-type="submit"
              class="login-btn"
              :loading="updateMachine.loading.value"
            >
              Save Changes
            </NButton>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="deleteMachine.dialog.value"
      preset="card"
      title="Are you sure?"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <div class="pb-4">
        Do you really want to delete <strong> {{ selectedItem.name }}?</strong>
        <br />
        This can not be undone.
        <br />
        <div class="flex justify-between mt-4">
          <NButton type="error" @click="deleteItem">Yes</NButton>
          <NButton type="primary" @click="deleteMachine.dialog.value = false">No</NButton>
        </div>
      </div>
    </NModal>

    <NModal
      v-model:show="deleteValueMachine.dialog.value"
      preset="card"
      title="Are you sure?"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <div class="pb-4">
        Do you really want to delete <strong> {{ selectedItem.value }}?</strong>
        <br />
        This can not be undone.
        <br />
        <div class="flex justify-between mt-4">
          <NButton type="error" @click="deleteValue">Yes</NButton>
          <NButton type="primary" @click="deleteValueMachine.dialog.value = false">No</NButton>
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
