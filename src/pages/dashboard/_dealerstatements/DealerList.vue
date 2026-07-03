<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { useDelete } from '@/composables/useDelete';
import { useRead } from '@/composables/useRead';
import { useUpdate } from '@/composables/useUpdate';
import { beautifyError } from '@/utils/functions';
import { addDealerSchema } from '@/utils/schemas';
import type { Dealer, SuccessResponse } from '@/utils/types';
import { CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { NIcon, NModal, NPopconfirm, NSpace, NTable, useMessage } from 'naive-ui';
import { onMounted, shallowReactive, shallowRef } from 'vue';

const message = useMessage();

// ========== Create ==========
const CreateMachine = useCreate<SuccessResponse>('/user/apps/dealer-statements/dealers', true);
const addFormData = shallowReactive({
  name: '',
  description: ''
});

const createItem = async () => {
  await CreateMachine.start(addFormData);

  if (CreateMachine.error.value) {
    message.error(beautifyError(CreateMachine.error.value.message));
    return;
  }

  message.success(CreateMachine.response?.value?.message || 'Dealer added successfully!');

  addFormData.name = '';
  addFormData.description = '';
  CreateMachine.dialog.value = false;

  ReadMachine.start();
};

// ============= Read ================
const ReadMachine = useRead<Dealer[]>('/user/apps/dealer-statements/dealers', true);

// ============= Edit ================
const EditMachine = useUpdate(true);
const selectedDealer = shallowRef<Dealer | null>(null);

const editItem = async () => {
  // selectedDealer.value = item;
  // editMachine.dialog.value = true;
  if (!selectedDealer.value) {
    return;
  }

  await EditMachine.start(
    `/user/apps/dealer-statements/dealers/${selectedDealer.value.id}`,
    selectedDealer.value
  );

  if (EditMachine.error.value) {
    message.error(beautifyError(EditMachine.error.value.message));
    return;
  }

  message.success(EditMachine.response?.value?.message || 'Dealer updated successfully!');

  selectedDealer.value = null;
  EditMachine.dialog.value = false;
};

// ============= Delete ================
const DeleteMachine = useDelete(true);

const deleteItem = async (id: number) => {
  await DeleteMachine.start(`/user/apps/dealer-statements/dealers/${id}`);

  if (DeleteMachine.error.value) {
    message.error(beautifyError(DeleteMachine.error.value.message));
    return;
  }

  ReadMachine.start();
};
onMounted(() => {
  ReadMachine.start();
});
</script>

<template>
  <div>
    <div class="flex justify-between">
      <div></div>
      <NButton @click="CreateMachine.dialog.value = true" type="primary" size="small">
        Add New Dealer</NButton
      >
    </div>
    <NTable size="small" class="mt-2">
      <thead>
        <tr>
          <th>Index</th>
          <th>Dealer Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in ReadMachine.response.value">
          <td>{{ i + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>

          <td>
            <NSpace>
              <NButton
                @click="
                  selectedDealer = item;
                  EditMachine.dialog.value = true;
                "
                size="tiny"
                type="primary"
                ghost
              >
                <NIcon>
                  <CreateOutline></CreateOutline>
                </NIcon>
              </NButton>

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
      v-model:show="CreateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add New Dealer"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <AForm :schema="addDealerSchema" :formData="addFormData" @submit="createItem">
        <AFormInput name="name" label="Dealer Name" />
        <AFormInput name="description" label="Description" />
        <NButton type="primary" attr-type="submit">Submit</NButton>
      </AForm>
    </NModal>

    <NModal
      v-model:show="EditMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit Dealer"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <AForm
        v-if="selectedDealer"
        :schema="addDealerSchema"
        :formData="selectedDealer"
        @submit="editItem"
      >
        <AFormInput name="name" label="Dealer Name" />
        <AFormInput name="description" label="Description" />
        <NButton type="primary" attr-type="submit">Save Changes</NButton>
      </AForm>
    </NModal>
  </div>
</template>
