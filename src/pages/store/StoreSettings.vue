<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError, getUploadedUrl } from '@/utils/functions';
import type { Page, SuccessResponse } from '@/utils/types';
import {
  NPagination,
  NTable,
  useMessage,
  NInput,
  NEmpty,
  NDropdown,
  NModal,
  NIcon,
  NTag,
  NSelect,
  NCheckbox,
  NCard
} from 'naive-ui';
import { onMounted, ref, shallowReactive, watch } from 'vue';
import { CreateOutline, EllipsisVerticalOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import { useRoute, useRouter } from 'vue-router';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import AFormInputNumber from '@/components/form/AFormInputNumber.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { addEditPageSchema, editStoreInfoSchema } from '@/utils/schemas';
import { useCreateFormData } from '@/composables/useCreateFormData';

const message = useMessage();

const { storeInfoMachine } = useStoreInfo();

const updateStoreInfoMachine = useUpdate<SuccessResponse>(true);

const saveStoreInfo = async () => {
  // console.log(updateStoreInfoMachine.error.value);

  await updateStoreInfoMachine.start(`/store/settings/store-info`, {
    name: storeInfoMachine.response.value?.name,
    metaTitle: storeInfoMachine.response.value?.metaTitle,
    metaDescription: storeInfoMachine.response.value?.metaDescription,
    metaKeywords: storeInfoMachine.response.value?.metaKeywords,
    showNextToLogo: storeInfoMachine.response.value?.showNextToLogo
  });
  console.log(updateStoreInfoMachine.error.value);
  if (updateStoreInfoMachine.error.value) {
    message.error(beautifyError(updateStoreInfoMachine.error.value));
  } else {
    message.success(updateStoreInfoMachine.response.value?.message!);
  }
};

const updateLogoMachine = useCreateFormData<SuccessResponse>(
  `/store/settings/update-logo`,
  true,
  'PUT'
);

const handleLogoChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  await updateLogoMachine.start({ 'web-logo': file });

  if (updateLogoMachine.error.value) {
    message.error(beautifyError(updateLogoMachine.error.value));
  } else {
    message.success(updateLogoMachine.response.value?.message!);
    storeInfoMachine.start();
  }
};

const updateFaviconMachine = useCreateFormData<SuccessResponse>(
  `/store/settings/update-favicon`,
  true,
  'PUT'
);

const handleFaviconChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  await updateFaviconMachine.start({ favicon: file });

  if (updateFaviconMachine.error.value) {
    message.error(beautifyError(updateFaviconMachine.error.value));
  } else {
    message.success(updateFaviconMachine.response.value?.message!);
    storeInfoMachine.start();
  }
};

onMounted(() => {
  storeInfoMachine.start();
});
</script>

<template>
  <div class="store-page">
    <NCard class="mt-4" title="Images">
      <div class="grid grid-cols-1 md:grid-cols-2 items-center">
        <div v-if="storeInfoMachine.response.value">
          <div>Website Logo</div>
          <div class="website-logo mt-2 flex items-center gap-2">
            <img :src="getUploadedUrl(storeInfoMachine.response.value?.logoUrl || '')" alt="Logo" />

            <input
              style="display: none"
              type="file"
              name="web-logo"
              id="web-logo"
              accept="image/*"
              @change="handleLogoChange"
            />

            <label for="web-logo" class="upload-button">
              <NIcon>
                <CreateOutline />
              </NIcon>
            </label>
          </div>
        </div>

        <div class="mt-6 md:mt-0">
          <div>Favicon Icon (32x32 png or ico)</div>
          <div class="favicon-icon mt-2 flex items-center gap-2">
            <img
              :src="getUploadedUrl(storeInfoMachine.response.value?.faviconUrl || '')"
              alt="Favicon"
            />

            <input
              style="display: none"
              type="file"
              name="favicon"
              id="favicon"
              accept="image/*"
              @change="handleFaviconChange"
            />

            <label for="favicon" class="upload-button">
              <NIcon>
                <CreateOutline />
              </NIcon>
            </label>
          </div>
        </div>
      </div>
    </NCard>

    <NCard title="Store Details" class="mt-5 mb-20">
      <AForm
        v-if="storeInfoMachine.response.value"
        @successSubmit="saveStoreInfo"
        :formData="storeInfoMachine.response.value"
        :schema="editStoreInfoSchema"
        debug
      >
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <AFormInput name="name" label="Store Name" />
            <NCheckbox
              v-model:checked="storeInfoMachine.response.value.showNextToLogo"
              label="Show Next To Logo"
            />
          </div>
          <AFormInput name="metaTitle" label="Meta Title" />
          <AFormInput name="metaDescription" label="Meta Description" />
          <div>
            <strong class="text-gray-600">Meta Keywords</strong>
          </div>
          <NSelect
            placeholder="Start typing"
            v-model:value="storeInfoMachine.response.value.metaKeywords"
            filterable
            multiple
            tag
            :options="[]"
          >
            <template #empty> Type and press Enter to select </template>
          </NSelect>
        </div>

        <div class="mt-5 text-center">
          <NButton type="primary" attr-type="submit">Save Changes</NButton>
        </div>
      </AForm>
    </NCard>
  </div>
</template>

<style scoped>
.website-logo img {
  height: 50px;
  width: auto;
}

.favicon-icon img {
  width: 50px;
  height: 50px;
}
</style>
