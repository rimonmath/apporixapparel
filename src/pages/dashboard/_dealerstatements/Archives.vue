<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { useDelete } from '@/composables/useDelete';
import { useRead } from '@/composables/useRead';
import { useUpdate } from '@/composables/useUpdate';
import { beautifyError, printHTML } from '@/utils/functions';
import { addDealerSchema } from '@/utils/schemas';
import type { Archives, SuccessResponse } from '@/utils/types';
import { CreateOutline, EyeOutline, TrashOutline } from '@vicons/ionicons5';
import { NIcon, NModal, NPopconfirm, NSpace, NTable, NTag, useMessage } from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef } from 'vue';

const message = useMessage();

// ============= Read ================
const ReadMachine = useRead<Archives[]>('/user/apps/dealer-statements/archives', true);

// ============= Delete ================
const DeleteMachine = useDelete(true);
const selectedItem = shallowRef<Archives | null>(null);

const deleteItem = async (id: number) => {
  await DeleteMachine.start(`/user/apps/dealer-statements/archives/${id}`);

  if (DeleteMachine.error.value) {
    message.error(beautifyError(DeleteMachine.error.value.message));
    return;
  }

  ReadMachine.start();
};
onMounted(() => {
  ReadMachine.start();
});

const detailsDialog = shallowRef(false);

const detailsMachine = useRead<Archives>('/user/apps/dealer-statements/archives', true);
const getDetails = async (item: Archives) => {
  detailsMachine.start(`/user/apps/dealer-statements/archives/${item.id}`);

  if (detailsMachine.error.value) {
    message.error(beautifyError(detailsMachine.error.value.message));
    return;
  }
  detailsDialog.value = true;
};

const totalIncome = computed(() => {
  return detailsMachine.response.value?.data.reduce((acc, item) => {
    if (item.type === 'Credit') {
      return acc + Number(item.amount);
    } else {
      return acc - Number(item.amount);
    }
  }, 0);
});

const printArchive = () => {
  const html = document.getElementById('print-archive-table')!.outerHTML;
  detailsDialog.value = false;
  setTimeout(() => {
    printHTML(html);
  }, 500);
};
</script>

<template>
  <div>
    <NTable size="small" class="mt-2">
      <thead>
        <tr>
          <th>Index</th>
          <th>Dealer Name</th>
          <th>Date</th>
          <th>Details</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in ReadMachine.response.value">
          <td>{{ i + 1 }}</td>
          <td>{{ item.dealerName }}</td>
          <td>{{ item.entryDate }}</td>
          <td>
            <NButton
              size="tiny"
              title="View Details"
              type="primary"
              ghost
              @click="getDetails(item)"
            >
              <div class="space-x-1 flex items-center">
                <NIcon>
                  <EyeOutline />
                </NIcon>
                <span>View Details</span>
              </div>
            </NButton>
          </td>
          <td>
            <NSpace>
              <NPopconfirm
                positive-text="Yes"
                negative-text="No"
                @positive-click="deleteItem(item.id)"
              >
                <template #trigger>
                  <NButton size="tiny" title="Delete" type="error" ghost>
                    <NIcon>
                      <TrashOutline />
                    </NIcon>
                  </NButton>
                </template>
                Do you really want to delete this item? This can not be undone.
              </NPopconfirm>
            </NSpace>
          </td>
        </tr>
      </tbody>
    </NTable>

    <NModal
      v-model:show="detailsDialog"
      class="custom-card"
      preset="card"
      :title="`${detailsMachine.response.value?.dealerName} Statements Archived at ${detailsMachine.response.value?.entryDate}`"
      :bordered="false"
      :style="{ width: '900px' }"
    >
      <NTable id="print-archive-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Dealer</th>
            <th>Type</th>
            <th>Note</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in detailsMachine.response.value?.data">
            <td>{{ item.entryDate }}</td>
            <td>{{ detailsMachine.response.value?.dealerName }}</td>
            <td>
              <NTag size="small" round :type="item.type === 'Credit' ? 'success' : 'error'">
                {{ item.type }}
              </NTag>
            </td>
            <td>{{ item.note }}</td>
            <td>
              <span :class="item.type === 'Credit' ? 'text-green-600' : 'text-red-600'">
                {{ item.type === 'Credit' ? '+' : '-' }}
                {{ item.amount }}
              </span>
            </td>
          </tr>
          <tr>
            <td colspan="4" class="text-right">Total =</td>
            <td>
              <span>
                {{ totalIncome }}
              </span>
            </td>
          </tr>
        </tbody>
      </NTable>
      <div class="text-center mt-4">
        <NButton @click="printArchive">Print</NButton>
      </div>
    </NModal>
  </div>
</template>
