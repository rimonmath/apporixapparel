<script setup lang="ts">
import type { IncomeExpenseItem } from '@/utils/types';
import { CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { NIcon, NPopconfirm, NSpace, NTable, NTag } from 'naive-ui';
import { computed } from 'vue';

type Props = {
  items: IncomeExpenseItem[];
  showTotal?: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits(['editDetails', 'deleteItem']);

const totalIncome = computed(() => {
  return props.items.reduce((acc, item) => {
    if (item.type === 'Income') {
      return acc + Number(item.amount);
    } else {
      return acc - Number(item.amount);
    }
  }, 0);
});
</script>

<template>
  <NTable>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Note</th>
        <th>Amount</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items">
        <td>{{ item.entryDate }}</td>
        <td>
          <NTag size="small" round :type="item.type === 'Income' ? 'success' : 'error'">
            {{ item.type }}
          </NTag>
        </td>
        <td>{{ item.note }}</td>
        <td>
          <span :class="item.type === 'Income' ? 'text-green-600' : 'text-red-600'">
            {{ item.type === 'Income' ? '+' : '-' }}
            {{ item.amount }}
          </span>
        </td>
        <td>
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
      <tr v-if="showTotal">
        <td colspan="3" class="text-right">Total =</td>
        <td>
          <span :class="totalIncome >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ totalIncome >= 0 ? '+' : '-' }}
            {{ totalIncome }}
          </span>
        </td>
        <td></td>
      </tr>
    </tbody>
  </NTable>
</template>
