<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError } from '@/utils/functions';
import { addEditDeliveryOptionSchema } from '@/utils/schemas';
import type { SuccessResponse, DeliveryOption } from '@/utils/types';
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
import { useStoreInfo } from '@/composables/useStoreInfo';
import AFormInputNumber from '@/components/form/AFormInputNumber.vue';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const createMachine = useCreate<SuccessResponse>(`/store/doptions`, true);
const readMachine = useRead<DeliveryOption[], true>(`/store/doptions`, true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  name: '',
  charge: 0,
  weightLimit: 1
});

const resetForm = () => {
  addFormData.name = '';
  addFormData.charge = 0;
  addFormData.weightLimit = 1;
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

const selectedItem = ref<DeliveryOption | null>(null);

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit') {
    selectedItem.value = {
      ...item,
      charge: Number(item.charge),
      weightLimit: Number(item.weightLimit)
    };
    updateMachine.dialog.value = true;
  } else if (key === 'Delete') {
    selectedItem.value = {
      ...item,
      charge: Number(item.charge),
      weightLimit: Number(item.weightLimit)
    };
    deleteMachine.dialog.value = true;
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/doptions/${selectedItem.value?.id}`);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
    readMachine.start();
  }
};

const updateItem = async () => {
  if (!selectedItem.value?.id) {
    return;
  }

  await updateMachine.start(`/store/doptions/${selectedItem.value?.id}`, selectedItem.value);
  if (updateMachine.error.value) {
    message.error(beautifyError(updateMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
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
      <h4 class="my-4">All Delivery Options</h4>

      <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton>
    </div>

    <hr class="my-4" />

    <NEmpty
      class="mt-10"
      description="Nothing found!"
      v-if="!readMachine.loading.value && !readMachine.response.value?.length"
    >
    </NEmpty>

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
          <th>Charge</th>
          <th>Weight Limit (Kg)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in readMachine.response.value" :key="item.id">
          <td>{{ item.id }}</td>
          <td>
            <div class="flex items-center">
              <span class="ml-2">
                {{ item.name }}
              </span>
            </div>
          </td>
          <td>{{ item.charge }}</td>
          <td>{{ item.weightLimit }}</td>
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
                  label: 'Edit',
                  key: 'Edit'
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

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new option"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addEditDeliveryOptionSchema">
        <div class="space-y-1">
          <AFormInput label="Name" name="name" placeholder="Inside Dhaka / Outside Dhaka / ..." />
          <AFormInputNumber label="Charge" name="charge" placeholder="Charge in Tk." />
          <AFormInputNumber
            label="Weight Limit (Kg)"
            name="weightLimit"
            placeholder="Weight limit in kg"
          />

          <NButton
            block
            type="primary"
            attr-type="submit"
            class="login-btn"
            :loading="createMachine.loading.value"
          >
            Add Delivery Option
          </NButton>
        </div>
      </AForm>
    </NModal>

    <NModal
      :style="{ width: '400px' }"
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This option"
    >
      <AForm
        @successSubmit="updateItem"
        :formData="selectedItem!"
        :schema="addEditDeliveryOptionSchema"
      >
        <div class="grid grid-cols-1 gap-6">
          <div>
            <AFormInput label="Name" name="name" />
            <AFormInputNumber label="Charge" name="charge" />
            <AFormInputNumber label="Weight Limit" name="weightLimit" />

            <NButton
              block
              type="primary"
              attr-type="submit"
              class="login-btn"
              :loading="createMachine.loading.value"
            >
              Save Changes
            </NButton>
          </div>
        </div>
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
        Do you really want to delete {{ selectedItem?.name }}?
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
