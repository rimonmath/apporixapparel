<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import type { User } from '@/utils/types';
import { EllipsisVerticalOutline } from '@vicons/ionicons5';
import { NDropdown, NEmpty, NIcon, NInput, NPagination, NTable } from 'naive-ui';
import { onMounted, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const extra = shallowRef('');

const readMachine = useRead<User[], true>('/guest/users', true, {
  route,
  router,
  extra
});

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  // if (key === 'Edit User') {
  //   selectedItem.value = { ...item };
  //   updateMachine.dialog.value = true;
  // } else if (key === 'Change Password') {
  //   selectedItem.value = { id: item.id, name: item.name, password: '', confirmPassword: '' };
  //   changePasswordMachine.dialog.value = true;
  // }
  // if (key === 'Delete') {
  //   selectedItem.value = { ...item };
  //   deleteMachine.dialog.value = true;
  // }
};

onMounted(() => {
  readMachine.start();
});
</script>

<template>
  <div class="page-container">
    <div class="block md:flex justify-between items-center">
      <h2 class="my-4">All Users List</h2>
      <div class="flex items-center mb-2 md:mb-0">
        <NInput clearable placeholder="Search by name..." v-model:value="readMachine.s.value">
          <!-- <template #suffix> Search </template> -->
        </NInput>
        <div class="w-[220px]"></div>
      </div>

      <!-- <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton> -->
    </div>

    <NEmpty
      class="mt-10"
      description="Nothing found!"
      v-if="!readMachine.loading.value && !readMachine.response.value?.length"
    >
    </NEmpty>
    <div class="table-container">
      <NTable
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
            <th>Email</th>
            <th>User Type</th>
            <th>Active?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in readMachine.response.value" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.userType }}</td>
            <td>{{ item.isActive }}</td>

            <td>
              <NDropdown
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
                    label: 'Edit User',
                    key: 'Edit User'
                  },
                  {
                    label: 'Change Password',
                    key: 'Change Password'
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
              </NDropdown>
            </td>
          </tr>
        </tbody>
      </NTable>
    </div>
    <div class="my-4 p-2 bg-white flex justify-center" v-if="readMachine.response.value?.length">
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
</template>
