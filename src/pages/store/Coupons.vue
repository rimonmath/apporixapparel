<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError } from '@/utils/functions';
import { addEditCouponSchema } from '@/utils/schemas';
import type { SuccessResponse, Coupon } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon,
  NDatePicker,
  NCheckbox
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
import AFormSelect from '@/components/form/AFormSelect.vue';
import AFormDatePicker from '@/components/form/AFormDatePicker.vue';

const message = useMessage();

const createMachine = useCreate<SuccessResponse>(`/store/coupons`, true);
const readMachine = useRead<Coupon[], true>(`/store/coupons`, true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  code: '',
  type: 'Flat',
  discount: 0,
  minPurchase: 0,
  maxDiscount: 0,
  startDate: null,
  endDate: null,
  usageLimit: 0,
  usagePerUser: 0,
  isActive: true
});

const resetForm = () => {
  addFormData.code = '';
  addFormData.type = 'Flat';
  addFormData.discount = 0;
  addFormData.minPurchase = 0;
  addFormData.maxDiscount = 0;
  addFormData.startDate = null;
  addFormData.endDate = null;
  addFormData.usageLimit = 0;
  addFormData.usagePerUser = 0;
  addFormData.isActive = true;
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

const selectedItem = ref<Coupon | null>(null);

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit') {
    selectedItem.value = {
      ...item,
      discount: Number(item.discount),
      minPurchase: Number(item.minPurchase),
      maxDiscount: Number(item.maxDiscount)
    };
    updateMachine.dialog.value = true;
  } else if (key === 'Delete') {
    selectedItem.value = {
      ...item,
      discount: Number(item.discount),
      minPurchase: Number(item.minPurchase),
      maxDiscount: Number(item.maxDiscount)
    };
    deleteMachine.dialog.value = true;
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start(`/store/coupons/${selectedItem.value?.id}`);
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

  await updateMachine.start(`/store/coupons/${selectedItem.value?.id}`, selectedItem.value);
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
      <h4 class="my-4">All Coupons</h4>

      <!-- {{ addFormData }} -->

      <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton>
    </div>

    <hr class="my-4" />

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
            <th>Index</th>
            <th>Code</th>
            <th>Type</th>
            <th>Discount</th>
            <th>Min Purchase</th>
            <th>Max Discount</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Active?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in readMachine.response.value" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="flex items-center">
                <span class="ml-2">
                  {{ item.code }}
                </span>
              </div>
            </td>
            <td>{{ item.type }}</td>
            <td>{{ item.discount }}</td>
            <td>{{ item.minPurchase }}</td>
            <td>{{ item.maxDiscount }}</td>
            <td>{{ item.startDate }}</td>
            <td>{{ item.endDate }}</td>
            <td>
              {{ item.isActive ? 'Yes' : 'No' }}
            </td>
            <td>
              <n-dropdown
                trigger="click"
                placement="bottom-end"
                :show-arrow="true"
                :options="[
                  {
                    label: item.code,
                    key: item.code,
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
    </div>

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new coupon"
      :bordered="false"
      :style="{ width: '500px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addEditCouponSchema">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div class="space-y-1">
            <AFormInput label="Code" name="code" placeholder="Coupon code" />
            <AFormSelect
              label="Coupon Type"
              name="type"
              placeholder="Coupon type"
              :options="[
                {
                  label: 'Flat',
                  value: 'Flat'
                },
                {
                  label: 'Percentage',
                  value: 'Percentage'
                }
              ]"
            />
            <AFormInputNumber
              :label="
                addFormData.type === 'Flat' ? `Discount (Flat amount)` : `Discount (Percentage)`
              "
              name="discount"
              placeholder="Discount in Tk."
            />
            <AFormInputNumber
              label="Max Discount"
              name="maxDiscount"
              placeholder="Max discount in Tk."
            />
            <AFormInputNumber
              label="Min Purchase"
              name="minPurchase"
              placeholder="Min purchase in Tk."
            />
          </div>
          <div class="space-y-1">
            <AFormInputNumber label="Usage Limit" name="usageLimit" placeholder="Usage limit" />
            <AFormInputNumber
              label="Usage per user"
              name="usagePerUser"
              placeholder="Usage per user"
            />
            <AFormDatePicker label="StartDate" name="startDate" placeholder="Start Date" />
            <AFormDatePicker label="End Date" name="endDate" placeholder="End Date" />

            <strong class="text-gray-600"> Status </strong>
            <div class="mt-2">
              <NCheckbox v-model:checked="addFormData.isActive" label="Active" />
            </div>
          </div>
        </div>
        <NButton
          block
          type="primary"
          attr-type="submit"
          class="login-btn"
          :loading="createMachine.loading.value"
        >
          Add Coupon
        </NButton>
      </AForm>
    </NModal>

    <NModal
      :style="{ width: '500px' }"
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This Coupon"
    >
      <AForm @successSubmit="updateItem" :formData="selectedItem!" :schema="addEditCouponSchema">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <AFormInput label="Code" name="code" />
            <AFormInput label="Type" name="type" />
            <AFormInputNumber label="Discount" name="discount" />
            <AFormInputNumber
              label="Min Purchase"
              name="minPurchase"
              placeholder="Min purchase in Tk."
            />
            <AFormInputNumber
              label="Max Discount"
              name="maxDiscount"
              placeholder="Max discount in Tk."
            />
          </div>
          <div>
            <AFormInputNumber label="Usage Limit" name="usageLimit" placeholder="Usage limit" />
            <AFormInputNumber
              label="Usage per user"
              name="usagePerUser"
              placeholder="Usage per user"
            />
            <AFormDatePicker label="StartDate" name="startDate" placeholder="Start Date" />
            <AFormDatePicker label="End Date" name="endDate" placeholder="End Date" />

            <strong class="text-gray-600"> Status </strong>
            <div class="mt-2" v-if="selectedItem">
              <NCheckbox v-model:checked="selectedItem.isActive" label="Active" />
            </div>
          </div>
        </div>
        <NButton
          block
          type="primary"
          attr-type="submit"
          class="login-btn"
          :loading="createMachine.loading.value"
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
      :style="{ width: '400px' }"
    >
      <div class="pb-4">
        Do you really want to delete {{ selectedItem?.code }}?
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
