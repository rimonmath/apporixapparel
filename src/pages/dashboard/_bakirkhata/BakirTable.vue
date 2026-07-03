<script setup lang="ts">
import type { BakirKhataItem } from '@/utils/types';
import { CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { NIcon, NPopconfirm, NSpace, NTable } from 'naive-ui';

type Props = {
  items: BakirKhataItem[];
};

const props = defineProps<Props>();

const emit = defineEmits(['editReturns', 'editDetails', 'deleteItem']);
</script>

<template>
  <NTable>
    <thead>
      <tr>
        <th>Date</th>
        <th>Customer Name</th>
        <th>Amount</th>
        <th>Reason</th>
        <th>Note</th>
        <th>Returns</th>
        <th>Total Returns</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items">
        <td>{{ item.entryDate }}</td>
        <td>{{ item.customerName }}</td>
        <td>{{ item.amount }}</td>
        <td>{{ item.reason }}</td>
        <td>{{ item.note }}</td>
        <td>
          <div class="flex items-center justify-between">
            <span>
              {{ item.returns.map((returnItem) => returnItem.returnAmount).join('+') }}
            </span>

            <NButton @click="emit('editReturns', item)" size="tiny">
              <NIcon>
                <CreateOutline></CreateOutline>
              </NIcon>
            </NButton>
          </div>
        </td>
        <td>{{ item.totalReturns }}</td>
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
    </tbody>
  </NTable>
</template>
