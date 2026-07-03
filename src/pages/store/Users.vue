<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { genders, userTypes } from '@/utils/data';
import { beautifyError } from '@/utils/functions';
import { addUserSchema, changePasswordSchema, editUserSchema } from '@/utils/schemas';
import type { SuccessResponse, User } from '@/utils/types';
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
import { onMounted, ref, shallowReactive } from 'vue';
import { EllipsisVerticalOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';

const message = useMessage();

const router = useRouter();
const route = useRoute();

const createMachine = useCreate<SuccessResponse>('/admin/users', true);
const readMachine = useRead<User[], true>('/admin/users', true, { route, router });
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const changePasswordMachine = useUpdate<SuccessResponse>(true);

const addFormData = shallowReactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  gender: null,
  userType: null,
  address: ''
});

const resetForm = () => {
  addFormData.email = '';
  addFormData.password = '';
  addFormData.confirmPassword = '';
  addFormData.name = '';
  addFormData.gender = null;
  addFormData.userType = null;
  addFormData.address = '';
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

const selectedItem: Record<string, any> = ref({});

const handleActionClick = (key: string, item: any) => {
  // console.log(key, item);
  if (key === 'Edit User') {
    selectedItem.value = { ...item };
    updateMachine.dialog.value = true;
  } else if (key === 'Change Password') {
    selectedItem.value = { id: item.id, name: item.name, password: '', confirmPassword: '' };
    changePasswordMachine.dialog.value = true;
  }
  if (key === 'Delete') {
    selectedItem.value = { ...item };
    deleteMachine.dialog.value = true;
  }
};

const saveChanges = async () => {
  // console.log(selectedItem.value);
  await updateMachine.start('/admin/users/' + selectedItem.value.id, selectedItem.value);
  if (updateMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
    readMachine.start();
  }
};

const changePassword = async () => {
  // console.log(selectedItem.value);
  await changePasswordMachine.start('/admin/users/' + selectedItem.value.id + '/change-password', {
    id: selectedItem.value.id,
    password: selectedItem.value.password
  });
  if (changePasswordMachine.error.value) {
    message.error(beautifyError(changePasswordMachine.error.value));
  } else {
    message.success(changePasswordMachine.response.value?.message!);
    changePasswordMachine.dialog.value = false;
    readMachine.start();
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start('/admin/users/' + selectedItem.value.id);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
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
      <h1 class="my-4 text-lg">All Users List</h1>
      <div class="mb-2 md:mb-0">
        <n-input clearable placeholder="Search by name..." v-model:value="readMachine.s.value">
          <!-- <template #suffix> Search </template> -->
        </n-input>
      </div>
      <NButton type="primary" @click="createMachine.dialog.value = true">Add New</NButton>
    </div>

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
          <th>Email</th>
          <th>User Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in readMachine.response.value" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.userType }}</td>
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
            </n-dropdown>
          </td>
        </tr>
      </tbody>
    </n-table>

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

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new user"
      :bordered="false"
      :style="{ width: '700px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addUserSchema">
        <template #default="{ errors }">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <AFormInput label="Email" name="email" :errors="errors" :formData="addFormData" />
              <AFormInput label="Full Name" name="name" :errors="errors" :formData="addFormData" />

              <AFormSelect
                label="Gender"
                placeholder="Select gender"
                name="gender"
                :options="genders"
                :errors="errors"
                :formData="addFormData"
              />

              <AFormSelect
                label="User Type"
                placeholder="Select Type"
                name="userType"
                :options="userTypes"
                :errors="errors"
                :formData="addFormData"
              />
            </div>
            <div>
              <AFormInput
                name="password"
                label="Password"
                type="password"
                show-password-on="click"
                placeholder="Enter user's password"
                :errors="errors"
                :formData="addFormData"
              />

              <AFormInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                show-password-on="click"
                placeholder="Confirm user's password"
                :errors="errors"
                :formData="addFormData"
              />

              <AFormInput
                label="Address"
                name="address"
                type="textarea"
                :rows="5"
                placeholder="Address..."
                :errors="errors"
                :formData="addFormData"
              />

              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="createMachine.loading.value"
              >
                Add User
              </NButton>
            </div>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This user"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="saveChanges" :formData="selectedItem" :schema="editUserSchema">
        <template #default="{ errors }">
          <div>
            <!-- {{ selectedItem }} -->
            <AFormInput label="Full Name" name="name" :errors="errors" :formData="selectedItem" />

            <AFormSelect
              label="Gender"
              placeholder="Select gender"
              name="gender"
              :options="genders"
              :errors="errors"
              :formData="selectedItem"
            />

            <AFormSelect
              label="User Type"
              placeholder="Select Type"
              name="userType"
              :options="userTypes"
              :errors="errors"
              :formData="selectedItem"
            />

            <AFormInput
              label="Address"
              name="address"
              type="textarea"
              :rows="3"
              placeholder="Address..."
              :errors="errors"
              :formData="selectedItem"
            />

            <NButton
              block
              type="primary"
              attr-type="submit"
              class="login-btn"
              :loading="updateMachine.loading.value"
            >
              Save Changes
            </NButton>
          </div>
        </template>
      </AForm>
    </NModal>

    <NModal
      v-model:show="changePasswordMachine.dialog.value"
      class="custom-card"
      preset="card"
      :title="`Change Password`"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <p>
        Change password for the user <strong>{{ selectedItem.name }}</strong>
      </p>

      <hr class="my-4" />
      <AForm
        @successSubmit="changePassword"
        :formData="selectedItem"
        :schema="changePasswordSchema"
      >
        <template #default="{ errors }">
          <div>
            <AFormInput
              name="password"
              label="Password"
              type="password"
              show-password-on="click"
              placeholder="Enter user's password"
              :errors="errors"
              :formData="selectedItem"
            />

            <AFormInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              show-password-on="click"
              placeholder="Confirm user's password"
              :errors="errors"
              :formData="selectedItem"
            />

            <div class="mt-4">
              <NButton
                block
                type="primary"
                attr-type="submit"
                class="login-btn"
                :loading="changePasswordMachine.loading.value"
              >
                Change Password
              </NButton>
            </div>
          </div>
        </template>
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
        Do you really want to delete {{ selectedItem.name }}?
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
