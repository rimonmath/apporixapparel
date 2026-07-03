<script setup lang="ts">
import { NAlert, NIcon, NModal, NSpace, NTable, useMessage } from 'naive-ui';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import { AddOutline, AppsOutline } from '@vicons/ionicons5';
import { useCreate } from '@/composables/useCreate';
import { addStoreSchema } from '@/utils/schemas';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
// import { SigninResponse } from '@/utils/types';
import type { Store, SuccessResponse } from '@/utils/types.js';
import { computed, onMounted, ref, shallowReactive } from 'vue';
import { useRead } from '@/composables/useRead';
import { beautifyError } from '@/utils/functions';
import { useStoreInfo } from '@/composables/useStoreInfo';
const { getProileMacine } = useDashboardHeader();

// SigninResponse

const message = useMessage();

const readMachine = useRead<Store[]>('/user/stores', true);
const createMachine = useCreate<SuccessResponse & { refreshToken: string }>('/user/stores', true);

const addFormData = shallowReactive({
  name: '',
  subDomain: ''
});

const availableSubdomains = ref<string[]>([]);

const feedback = computed(() => {
  if (addFormData.subDomain === '') {
    return '';
  }
  return availableSubdomains.value.includes(addFormData.subDomain) ? 'Available' : 'Already taken';
});

async function addItem() {
  // return;
  await createMachine.start(addFormData);

  if (createMachine.error.value) {
    message.error(beautifyError(createMachine.error.value));
    return;
  }

  readMachine.start();
  addFormData.name = '';
  addFormData.subDomain = '';
  createMachine.dialog.value = false;
  // console.log(createMachine.response.value);

  localStorage.setItem('accessToken', createMachine.response.value!.refreshToken);
}

onMounted(() => {
  readMachine.start();
  document.body.style.setProperty('--primary-color', '#00ae64');
});

const getSroreUrl = (subDomain: string) =>
  import.meta.env.VITE_API_DOMAIN === 'http://localhost:3123'
    ? `http://${subDomain}.localhost:5123`
    : `https://${subDomain}.khudroshop.com`;
</script>

<template>
  <div class="container py-10">
    <div class="px-0 md:px-4">
      <NAlert :title="`Welcome back ${getProileMacine.response.value?.name}!`" type="info">
        <p class="my-5">Great to see you again! Signin to your store and explore.</p>
      </NAlert>

      <hr class="my-5" />

      <div class="mt-4 flex justify-between items-center">
        <h4>Your Stores</h4>
        <NButton type="primary" @click="createMachine.dialog.value = true">
          <NIcon>
            <AddOutline></AddOutline>
          </NIcon>
          New Store
        </NButton>
      </div>

      <div class="table-container">
        <n-table :bordered="false" :single-line="false" class="mt-4" size="small">
          <thead>
            <tr>
              <th>Index</th>
              <th>Store Name</th>
              <th>URL</th>
              <th>Brand Color</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(store, i) in readMachine.response.value">
              <td>{{ i + 1 }}</td>
              <td>
                {{ store.name }}
              </td>
              <td>{{ store.subDomain }}.khudroshop.com</td>
              <td>
                <div class="w-10 h-5" :style="{ backgroundColor: `${store.brandColor}` }"></div>
              </td>
              <td>
                <NSpace>
                  <SmartLink :to="`/store/${store.subDomain}`">
                    <NButton size="small" type="primary" quaternary>Manage</NButton>
                  </SmartLink>
                  <a target="_blank" :href="getSroreUrl(store.subDomain)">
                    <NButton size="small" type="info" quaternary>Visit</NButton>
                  </a>

                  <NButton size="small" type="error" quaternary>Delete</NButton>
                </NSpace>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </div>

    <NModal
      v-model:show="createMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add new store"
      :bordered="false"
      :style="{ width: '350px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addStoreSchema">
        <div class="py-4 space-y-4">
          <AFormInput
            label="Domain"
            placeholder="example"
            name="subDomain"
            suffix=".khudroshop.com"
            maxlength="63"
          />

          <AFormInput
            label="Store Name"
            placeholder="Your Store Name"
            name="name"
            maxlength="100"
          />

          <NButton block type="primary" attr-type="submit" :loading="createMachine.loading.value">
            Create Store
          </NButton>
        </div>
      </AForm>
    </NModal>
  </div>
</template>

<style scoped></style>
