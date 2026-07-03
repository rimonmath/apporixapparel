<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormDatePicker from '@/components/form/AFormDatePicker.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { addIncomeExpenseSchema } from '@/utils/schemas';
import {
  NIcon,
  NInput,
  NModal,
  NPagination,
  NSelect,
  NSkeleton,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef, watch } from 'vue';
import { beautifyError } from '@/utils/functions';
import { useRead } from '@/composables/useRead';
import type { IncomeExpenseItem } from '@/utils/types';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowBackOutline,
  ArrowForwardOutline,
  RefreshOutline,
  SearchOutline
} from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import IETable from './_ie/IETable.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';

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

const readMachine = useRead<IncomeExpenseItem[], true>('/user/apps/income-expenses', true, {
  router,
  route,
  extra
});
const createMachine = useCreate('/user/apps/income-expenses', true);

readMachine.pageSize.value = 500;

const createFormData = shallowReactive({
  amount: '',
  note: '',
  entryDate: null,
  type: 'Income'
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
  createFormData.amount = '';
  createFormData.note = '';
  createFormData.entryDate = null;
  createFormData.type = 'Income';
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

const selectedItem = shallowRef<IncomeExpenseItem | null>(null);

const editDetailsMachine = useUpdate(true);

const prepareEditDetails = (item: IncomeExpenseItem) => {
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

  await editDetailsMachine.start('/user/apps/income-expenses/' + selectedItem.value?.id, payload);
  if (editDetailsMachine.error.value) {
    message.error(beautifyError(editDetailsMachine.error?.value));
  }

  message.success(editDetailsMachine.response.value?.message || 'Details updated successfully!');
  readMachine.start();
  editDetailsMachine.dialog.value = false;
};

const deleteMachine = useDelete(true);

const deleteItem = async (id: number) => {
  await deleteMachine.start('/user/apps/income-expenses/' + id);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error?.value));
  }

  message.success(deleteMachine.response.value?.message || 'Item deleted successfully!');
  readMachine.start();
};

const statMachine = useRead<Record<string, number>>('/user/apps/income-expenses/stats', true);

const grandTotal = computed(() => {
  return (
    Number(statMachine.response.value?.totalIncome) -
    Number(statMachine.response.value?.totalExpense)
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
          <NInput placeholder="Search by note..." v-model:value="readMachine.s.value" clearable />
          <NButton type="primary" @click="createMachine.dialog.value = true">Add Data</NButton>
        </div>

        <div class="table-container">
          <IETable
            v-if="readMachine.response.value"
            :items="readMachine.response.value"
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
          <IETable
            v-if="readMachine.response.value"
            :items="readMachine.response.value"
            @edit-details="prepareEditDetails"
            @delete-item="deleteItem"
            show-total
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
            <tr class="text-green-600">
              <th class="text-left">Total Income</th>
              <td class="px-2">:</td>
              <td>+ {{ statMachine.response.value?.totalIncome }}</td>
            </tr>
            <tr class="text-red-600">
              <th class="text-left">Total Expense</th>
              <td class="px-2">:</td>
              <td>- {{ statMachine.response.value?.totalExpense }}</td>
            </tr>
            <tr>
              <td colspan="3">
                <hr />
              </td>
            </tr>
            <tr :class="grandTotal >= 0 ? 'text-green-600' : 'text-red-600'">
              <th class="text-left">Total Balance</th>
              <td class="px-2">:</td>
              <td class="font-bold">
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

      <AForm @successSubmit="addData" :formData="createFormData" :schema="addIncomeExpenseSchema">
        <div>
          <AFormDatePicker label="Date" name="entryDate" placeholder="Date" class="w-full" />

          <AFormSelect
            label="Type"
            name="type"
            placeholder="Select Type"
            :options="[
              { label: 'Income', value: 'Income' },
              { label: 'Expense', value: 'Expense' }
            ]"
          />
          <AFormInput name="amount" placeholder="Amount" label="Amount" />
          <AFormInput name="note" placeholder="Note" label="Note" />
          <NButton type="primary" block attr-type="submit"> Add Data </NButton>
        </div>
      </AForm>
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
        :schema="addIncomeExpenseSchema"
      >
        <div>
          <AFormDatePicker label="Date" name="entryDate" placeholder="Date" class="w-full" />
          <AFormSelect
            label="Type"
            name="type"
            placeholder="Select Type"
            :options="[
              { label: 'Income', value: 'Income' },
              { label: 'Expense', value: 'Expense' }
            ]"
          />
          <AFormInput name="amount" placeholder="Amount" label="Amount" />
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
