<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormDatePicker from '@/components/form/AFormDatePicker.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { addBakirKhataItemSchema } from '@/utils/schemas';
import {
  NCard,
  NDatePicker,
  NIcon,
  NInput,
  NModal,
  NPagination,
  NPopconfirm,
  NSelect,
  NSkeleton,
  NSpace,
  NTable,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef, watch } from 'vue';
import { beautifyError } from '@/utils/functions';
import { useRead } from '@/composables/useRead';
import type { BakirKhataItem } from '@/utils/types';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowBackOutline,
  ArrowForwardOutline,
  CreateOutline,
  RefreshOutline,
  SearchOutline,
  TrashBinOutline,
  TrashOutline
} from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import BakirTable from './_bakirkhata/BakirTable.vue';

const today = new Date();
const month = shallowRef(today.getMonth());
const year = shallowRef(today.getFullYear());
const message = useMessage();

const months = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 }
];

const years = [
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
  { label: '2028', value: '2028' },
  { label: '2029', value: '2029' },
  { label: '2030', value: '2030' }
];

const activeTab = shallowRef('all');

watch(activeTab, (newValue) => {
  if (newValue === 'all') {
    readMachine.pageSize.value = 10;
    refreshData();
  } else if (newValue === 'monthly') {
    readMachine.pageSize.value = 500;
    refreshData();
  } else {
    statMachine.start();
  }
});

const router = useRouter();
const route = useRoute();
const extra = computed(() => {
  if (activeTab.value === 'all') {
    return '';
  }
  if ((!month.value || !year.value) && month.value !== 0) {
    return '';
  }

  const startDate = new Date(year.value, month.value, 1);
  const endDate = new Date(year.value, month.value + 1, 0);

  return `entryDate_gte=${startDate.toISOString().split('T')[0]}&entryDate_lte=${endDate.toISOString().split('T')[0]}`;
});

const readMachine = useRead<BakirKhataItem[], true>('/user/apps/bakir-khata', true, {
  router,
  route,
  extra
});
const createMachine = useCreate('/user/apps/bakir-khata', true);

readMachine.pageSize.value = 500;

const createFormData = shallowReactive({
  customerName: '',
  amount: '',
  reason: '',
  note: '',
  entryDate: null
});

const addData = async () => {
  // createMachine.openModal();
  await createMachine.start(createFormData);
  if (createMachine.error.value) {
    message.error(beautifyError(createMachine.error?.value));
  }

  message.success(createMachine.response.value?.message || 'Data added successfully!');
  readMachine.start();
  createMachine.dialog.value = false;
  resetCreateFormData();
};

const resetCreateFormData = () => {
  createFormData.customerName = '';
  createFormData.amount = '';
  createFormData.reason = '';
  createFormData.note = '';
  createFormData.entryDate = null;
};

const needToRefresh = shallowRef(true);

const refreshData = async () => {
  await readMachine.start();
  needToRefresh.value = false;
};

watch([month, year], (newValues, oldValues) => {
  // console.log(newValues, oldValues);
  // needToRefresh.value = true;
  refreshData();
});

const getPreviousMonthData = () => {
  if (month.value === 0) {
    month.value = 11;
    year.value--;
  } else {
    month.value--;
  }
  refreshData();
};

const getNextMonthData = () => {
  if (month.value === 11) {
    month.value = 0;
    year.value++;
  } else {
    month.value++;
  }
  refreshData();
};

const selectedItem = shallowRef<BakirKhataItem | null>(null);

const editReturnsMachine = useUpdate(true);

const removeReturn = (index: number) => {
  selectedItem.value?.returns.splice(index, 1);
};

const prepareEditReturns = (item: BakirKhataItem) => {
  selectedItem.value = item;
  editReturnsMachine.dialog.value = true;
  if (!item.returns.length) {
    selectedItem.value?.returns.push({
      returnDate: null,
      returnAmount: '0',
      note: ''
    });
  }
};

const editReturns = async () => {
  if (!selectedItem.value || !selectedItem.value.returns.length) {
    message.error('Nothing to save!');

    return;
  }

  for (let i = 0; i < selectedItem.value.returns.length; i++) {
    if (!selectedItem.value.returns[i].returnDate) {
      message.error('Return date is required!');
      return;
    }

    if (!selectedItem.value.returns[i].returnAmount) {
      message.error('Please enter a valid amount!');
      return;
    }
  }

  await editReturnsMachine.start('/user/apps/bakir-khata/' + selectedItem.value?.id + '/returns', {
    returns: selectedItem.value.returns
  });
  if (editReturnsMachine.error.value) {
    message.error(beautifyError(editReturnsMachine.error?.value));
  }

  message.success(editReturnsMachine.response.value?.message || 'Returns updated successfully!');
  editReturnsMachine.dialog.value = false;
};

watch(editReturnsMachine.dialog, (newValue) => {
  if (!newValue) {
    selectedItem.value = null;
    readMachine.start();
  }
});

const editDetailsMachine = useUpdate(true);

const prepareEditDetails = (item: BakirKhataItem) => {
  selectedItem.value = item;
  editDetailsMachine.dialog.value = true;
};

const editDetails = async () => {
  if (!selectedItem.value) {
    message.error('Nothing to save!');
    return;
  }

  const payload = {
    ...selectedItem.value,
    returns: null
  };

  await editDetailsMachine.start('/user/apps/bakir-khata/' + selectedItem.value?.id, payload);
  if (editDetailsMachine.error.value) {
    message.error(beautifyError(editDetailsMachine.error?.value));
  }

  message.success(editDetailsMachine.response.value?.message || 'Details updated successfully!');
  readMachine.start();
  editDetailsMachine.dialog.value = false;
};

const deleteMachine = useDelete(true);

const deleteItem = async (id: number) => {
  await deleteMachine.start('/user/apps/bakir-khata/' + id);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error?.value));
  }

  message.success(deleteMachine.response.value?.message || 'Item deleted successfully!');
  readMachine.start();
};

const statMachine = useRead<Record<string, number>>('/user/apps/bakir-khata/stats', true);

const grandTotal = computed(() => {
  return (
    Number(statMachine.response.value?.totalReturns) -
    Number(statMachine.response.value?.totalAmount)
  );
});

onMounted(() => {
  refreshData();
});
</script>

<template>
  <div class="container py-2">
    <!-- <h4>Bakir Khata App</h4> -->
    <!-- <NCard class="mt-5"> -->
    <NTabs type="line" animated v-model:value="activeTab">
      <NTabPane name="all" tab="All Data">
        <div class="flex justify-between w-full gap-2 mb-5">
          <NInput
            placeholder="Search by Customer Name..."
            v-model:value="readMachine.s.value"
            clearable
          />

          <NButton type="primary" @click="createMachine.dialog.value = true">Add Data</NButton>
        </div>

        <div class="table-container">
          <BakirTable
            v-if="readMachine.response.value"
            :items="readMachine.response.value"
            @edit-returns="prepareEditReturns"
            @edit-details="prepareEditDetails"
            @delete-item="deleteItem"
          />
          <div
            class="my-4 p-2 bg-white flex justify-center"
            v-if="readMachine.response.value?.length"
          >
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
      </NTabPane>
      <NTabPane name="monthly" tab="Monthly Data" class="my-4">
        <div class="flex justify-between w-full mb-5">
          <div class="flex md:flex-row flex-col items-start md:items-center gap-2 min-w-[200px]">
            <NButton @click="getPreviousMonthData" type="primary" ghost>
              <NIcon> <ArrowBackOutline /> </NIcon> <span class="ml-2">Previous Month</span>
            </NButton>
            <NSelect placeholder="Select Month" v-model:value="month" :options="months" />
            <NSelect placeholder="Select Year" v-model:value="year" :options="years" />
            <NButton type="primary" @click="refreshData" ghost>
              <NIcon>
                <RefreshOutline v-if="!needToRefresh" />
                <SearchOutline v-else />
              </NIcon>
            </NButton>
            <NButton @click="getNextMonthData" type="primary" ghost>
              <NIcon>
                <ArrowForwardOutline />
              </NIcon>
              <span class="ml-2">Next Month</span>
            </NButton>
          </div>
        </div>

        <div class="table-container">
          <BakirTable
            v-if="readMachine.response.value"
            :items="readMachine.response.value"
            @edit-returns="prepareEditReturns"
            @edit-details="prepareEditDetails"
            @delete-item="deleteItem"
          />
          <div
            class="my-4 p-2 bg-white flex justify-center"
            v-if="readMachine.response.value?.length && readMachine.pageCount.value > 1"
          >
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
      </NTabPane>

      <NTabPane name="statistics" tab="Statistics">
        <table class="mt-2 stat-table">
          <tbody>
            <tr>
              <th class="text-left">Total Baki Given</th>
              <td class="px-2">:</td>
              <td class="text-red-600">- {{ statMachine.response.value?.totalAmount }}</td>
            </tr>
            <tr>
              <th class="text-left">Total Returns</th>
              <td class="px-2">:</td>
              <td class="text-green-600">+ {{ statMachine.response.value?.totalReturns }}</td>
            </tr>
            <tr>
              <td colspan="3">
                <hr />
              </td>
            </tr>
            <tr>
              <th class="text-left">Profit / Loss</th>
              <td class="px-2">:</td>
              <td :class="grandTotal >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ grandTotal >= 0 ? '+' : '-' }}
                {{ grandTotal }}
              </td>
            </tr>
          </tbody>
        </table>
      </NTabPane>
    </NTabs>
    <!-- </NCard> -->

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add New Data"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm @successSubmit="addData" :formData="createFormData" :schema="addBakirKhataItemSchema">
        <div>
          <AFormDatePicker label="Date" name="entryDate" placeholder="Date" class="w-full" />
          <AFormInput name="customerName" placeholder="Customer Name" label="Customer Name" />
          <AFormInput name="amount" placeholder="Amount" label="Amount" />
          <AFormInput name="reason" placeholder="Reason" label="Reason" />
          <AFormInput name="note" placeholder="Note" label="Note" />
          <NButton type="primary" block attr-type="submit"> Add Data </NButton>
        </div>
      </AForm>
    </NModal>

    <NModal
      v-model:show="editReturnsMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit Returns"
      :bordered="false"
      :style="{ width: '750px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <div v-if="selectedItem">
        <div class="table-container">
          <NTable size="small">
            <thead>
              <tr>
                <th>Date</th>
                <th>Return Amount</th>
                <th>Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in selectedItem?.returns">
                <td>
                  <NDatePicker
                    v-model:formatted-value="item.returnDate"
                    value-format="yyyy-MM-dd"
                  />
                </td>
                <td>
                  <NInput v-model:value="item.returnAmount" />
                </td>
                <td>
                  <NInput v-model:value="item.note" />
                </td>
                <td>
                  <NButton size="tiny" type="error" attr-type="button" @click="removeReturn(i)">
                    <NIcon>
                      <TrashBinOutline />
                    </NIcon>
                  </NButton>
                </td>
              </tr>
            </tbody>
          </NTable>
        </div>
        <div class="text-right mb-5">
          <NButton
            size="small"
            type="primary"
            attr-type="button"
            @click="
              selectedItem.returns.push({
                returnDate: null,
                returnAmount: '0',
                note: ''
              })
            "
          >
            Add Row
          </NButton>
        </div>
        <NButton type="primary" block @click="editReturns"> Save Returns </NButton>
      </div>
    </NModal>

    <NModal
      v-model:show="editDetailsMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit Details"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        v-if="selectedItem"
        @successSubmit="editDetails"
        :formData="selectedItem"
        :schema="addBakirKhataItemSchema"
      >
        <div>
          <AFormDatePicker label="Date" name="entryDate" placeholder="Date" class="w-full" />
          <AFormInput name="customerName" placeholder="Customer Name" label="Customer Name" />
          <AFormInput name="amount" placeholder="Amount" label="Amount" />
          <AFormInput name="reason" placeholder="Reason" label="Reason" />
          <AFormInput name="note" placeholder="Note" label="Note" />
          <NButton type="primary" block attr-type="submit"> Save Changes </NButton>
        </div>
      </AForm>
    </NModal>
  </div>
</template>

<style scoped>
.stat-table th,
.stat-table td {
  padding: 4px;
}
</style>
