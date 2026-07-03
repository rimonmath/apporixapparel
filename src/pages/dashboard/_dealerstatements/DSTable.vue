<script setup lang="ts">
import { printHTML } from '@/utils/functions';
import type { DealerStatement, IncomeExpenseItem } from '@/utils/types';
import { CreateOutline, PrintOutline, TrashOutline } from '@vicons/ionicons5';
import { NIcon, NPopconfirm, NSpace, NTable, NTag } from 'naive-ui';
import { computed } from 'vue';

type Props = {
  items: DealerStatement[];
  showTotal?: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits(['editDetails', 'deleteItem', 'archive']);

const totalIncome = computed(() => {
  return props.items.reduce((acc, item) => {
    if (item.type === 'Credit') {
      return acc + Number(item.amount);
    } else {
      return acc - Number(item.amount);
    }
  }, 0);
});

function printStatement() {
  const table = document.getElementById('print-table');
  if (table) {
    const html = table.outerHTML;
    printHTML(html);
  }
}
</script>

<template>
  <div class="flex justify-between">
    <h4>Dealer Statements</h4>
    <NButton @click="printStatement" size="small" type="primary" ghost>
      <div class="flex items-center gap-2">
        <NIcon>
          <PrintOutline />
        </NIcon>
        <span>Print</span>
      </div>
    </NButton>
  </div>
  <NTable class="mt-4" id="print-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Dealer</th>
        <th>Type</th>
        <th>Note</th>
        <th>Amount</th>
        <th class="print:hidden">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items">
        <td>{{ item.entryDate }}</td>
        <td>{{ item.dealer.name }}</td>
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
        <td class="print:hidden">
          <NSpace>
            <NButton @click="emit('editDetails', item)" size="tiny" type="primary" ghost>
              <NIcon>
                <CreateOutline></CreateOutline>
              </NIcon>
            </NButton>

            <NPopconfirm
              positive-text="Yes"
              negative-text="No"
              @positive-click="emit('deleteItem', item.id)"
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
      <tr v-if="items.length">
        <td colspan="4" class="text-right">Total =</td>
        <td>
          <span :class="totalIncome >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ totalIncome >= 0 ? '+' : '' }}
            {{ totalIncome.toFixed(2) }}
          </span>
        </td>
        <td class="print:hidden">
          <NPopconfirm positive-text="Yes" negative-text="No" @positive-click="emit('archive')">
            <template #trigger>
              <NButton size="tiny" type="primary" ghost :disabled="totalIncome != 0">
                Archive
              </NButton>
            </template>
            Do you really want archive this data. You will not be able to update it later.
          </NPopconfirm>
        </td>
      </tr>
    </tbody>
  </NTable>
</template>
