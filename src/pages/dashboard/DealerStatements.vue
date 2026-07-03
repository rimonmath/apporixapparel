<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormDatePicker from '@/components/form/AFormDatePicker.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { addDealerStatementSchema } from '@/utils/schemas';
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
import type { Dealer, DealerStatement } from '@/utils/types';
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
import DealerList from './_dealerstatements/DealerList.vue';
import DSTable from './_dealerstatements/DSTable.vue';
import Archives from './_dealerstatements/Archives.vue';

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

const activeTab = shallowRef('statements');

const DealerListMachine = useRead<Dealer[]>('/user/apps/dealer-statements/dealers', true);

const dealers = computed(() =>
  DealerListMachine.response.value?.map((dealer) => ({
    label: dealer.name,
    value: dealer.id
  }))
);

watch(activeTab, (newValue) => {
  if (newValue === 'statements') {
    DealerListMachine.start();
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

const readMachine = useRead<DealerStatement[]>('', true);

const createMachine = useCreate('/user/apps/dealer-statements', true);

readMachine.pageSize.value = 500;
const selectedDealerId = shallowRef<number | null>(null);

const selectedDealerName = computed(() => {
  return dealers.value?.find((dealer) => dealer.value === selectedDealerId.value)?.label;
});

const createFormData = shallowReactive({
  amount: '',
  note: '',
  entryDate: null,
  type: 'Debit'
});

const addData = async () => {
  // createMachine.openModal();
  await createMachine.start({ ...createFormData, dealerId: selectedDealerId.value });

  if (createMachine.error.value) {
    message.error(beautifyError(createMachine.error?.value));
  }

  message.success(createMachine.response.value?.message || 'Statement added successfully!');
  refreshData(selectedDealerId.value!);
  createMachine.dialog.value = false;
  resetCreateFormData();
};

const resetCreateFormData = () => {
  createFormData.amount = '';
  createFormData.note = '';
  createFormData.entryDate = null;
  createFormData.type = 'Debit';
};

const refreshData = async (dealerId: number) => {
  console.log(dealerId);
  await readMachine.start(`/user/apps/dealer-statements?dealerId_eq=${dealerId}`);
};

watch([month, year], (newValues, oldValues) => {
  // console.log(newValues, oldValues);
  // needToRefresh.value = true;
  // refreshData();
});

const getPreviousMonthData = () => {
  if (month.value === 0) {
    month.value = 11;
    year.value--;
  } else {
    month.value--;
  }
  // refreshData();
};

const getNextMonthData = () => {
  if (month.value === 11) {
    month.value = 0;
    year.value++;
  } else {
    month.value++;
  }
  // refreshData();
};

const selectedItem = shallowRef<DealerStatement | null>(null);

const editDetailsMachine = useUpdate(true);

const prepareEditDetails = (item: DealerStatement) => {
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

  await editDetailsMachine.start('/user/apps/dealer-statements/' + selectedItem.value?.id, payload);
  if (editDetailsMachine.error.value) {
    message.error(beautifyError(editDetailsMachine.error?.value));
  }

  message.success(editDetailsMachine.response.value?.message || 'Details updated successfully!');
  refreshData(selectedDealerId.value!);
  editDetailsMachine.dialog.value = false;
};

const deleteMachine = useDelete(true);

const deleteItem = async (id: number) => {
  await deleteMachine.start('/user/apps/dealer-statements/' + id);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error?.value));
  }

  message.success(deleteMachine.response.value?.message || 'Item deleted successfully!');
  readMachine.start();
};

watch(selectedDealerId, (newValue) => {
  if (newValue) {
    refreshData(newValue);
  }
});

const archiveMachine = useCreate('/user/apps/dealer-statements/archives', true);

async function archive() {
  const payload = {
    dealerName: selectedDealerName.value,
    dealerId: selectedDealerId.value,
    data: readMachine.response.value?.map((item) => ({
      entryDate: item.entryDate,
      type: item.type,
      amount: item.amount,
      note: item.note
    })),
    entryDate: new Date().toISOString().split('T')[0]
  };

  await archiveMachine.start(payload);
  if (archiveMachine.error.value) {
    message.error(beautifyError(archiveMachine.error?.value));
  }

  message.success(archiveMachine.response.value?.message || 'Archived successfully!');
  refreshData(selectedDealerId.value!);
}

onMounted(async () => {
  await DealerListMachine.start();
  selectedDealerId.value = DealerListMachine.response.value?.[0].id || null;
  // await refreshData();
});
</script>

<template>
  <div class="container py-2">
    <NTabs type="line" animated v-model:value="activeTab">
      <NTabPane name="statements" tab="Statements">
        <div class="flex justify-between w-full gap-2 mb-5">
          <NSelect
            v-model:value="selectedDealerId"
            :options="dealers"
            placeholder="Select Dealer"
          />
          <NButton type="primary" @click="createMachine.dialog.value = true">Add Statement</NButton>
        </div>

        <div class="table-container">
          <DSTable
            v-if="readMachine.response.value"
            :items="readMachine.response.value"
            @edit-details="prepareEditDetails"
            @delete-item="deleteItem"
            @archive="archive"
          />
        </div>
      </NTabPane>

      <NTabPane name="dealer-list" tab="Dealer List">
        <DealerList />
      </NTabPane>

      <NTabPane name="archives" tab="Archives">
        <Archives />
      </NTabPane>
    </NTabs>
    <!-- </NCard> -->

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add New Statement"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        @successSubmit="addData"
        :formData="createFormData"
        :schema="addDealerStatementSchema"
        debug
      >
        <div v-if="selectedDealerId" class="space-y-1">
          <div class="mb-4">
            <NSelect
              label="Dealer"
              name="dealerId"
              placeholder="Select Dealer"
              :options="dealers"
              v-model:value="selectedDealerId"
              disabled
            />
          </div>
          <AFormDatePicker class="w-full" label="Date" name="entryDate" placeholder="Date" />

          <AFormSelect
            label="Type"
            name="type"
            placeholder="Select Type"
            :options="[
              { label: 'Debit', value: 'Debit' },
              { label: 'Credit', value: 'Credit' }
            ]"
          />
          <AFormInput name="amount" placeholder="Amount" label="Amount" />
          <AFormInput name="note" placeholder="e.g. Transaction Id" label="Note" />
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
        :schema="addDealerStatementSchema"
      >
        <div>
          <AFormDatePicker label="Date" name="entryDate" placeholder="Date" class="w-full" />
          <AFormSelect
            label="Type"
            name="type"
            placeholder="Select Type"
            :options="[
              { label: 'Debit', value: 'Debit' },
              { label: 'Credit', value: 'Credit' }
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
