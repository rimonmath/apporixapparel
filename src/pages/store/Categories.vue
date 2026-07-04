<script setup lang="ts">
import { useRead } from '@/composables/useRead';
import { useCreate } from '@/composables/useCreate';
import { beautifyError } from '@/utils/functions';
import { addCategorySchema, editCategorySchema } from '@/utils/schemas';
import type { Category, SuccessResponse } from '@/utils/types';
import { useMessage, NEmpty, NDropdown, NModal, NIcon, NCard, NCheckbox } from 'naive-ui';
import { computed, onMounted, ref, shallowReactive } from 'vue';
import { EllipsisVerticalOutline, EllipseOutline, RadioButtonOffOutline } from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useStoreInfo } from '@/composables/useStoreInfo';
import AFormInputNumber from '@/components/form/AFormInputNumber.vue';

const message = useMessage();

const createMachine = useCreate<SuccessResponse>('/store/categories', true);
const readMachine = useRead<Category[], true>('/store/categories', true);
const updateMachine = useUpdate<SuccessResponse>(true);
const deleteMachine = useDelete<SuccessResponse>(true);

const addFormData = shallowReactive({
  parentId: 0,
  name: '',
  isTop: false,
  order: 0
});

const resetForm = () => {
  addFormData.parentId = 0;
  addFormData.name = '';
  addFormData.isTop = false;
  addFormData.order = 0;
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
  if (key === 'Edit Category') {
    selectedItem.value = { ...item };
    updateMachine.dialog.value = true;
  } else if (key === 'Add Sub Category') {
    addFormData.parentId = item.id;
    createMachine.dialog.value = true;
  }

  if (key === 'Delete') {
    if (item.childs.length > 0) {
      message.error('Delete sub categories first!');
    } else {
      selectedItem.value = { ...item };
      deleteMachine.dialog.value = true;
    }
  }
};

const saveChanges = async () => {
  // console.log(selectedItem.value);
  await updateMachine.start(
    '/store/' + subDomain.value + '/categories/' + selectedItem.value.id,
    selectedItem.value
  );
  if (updateMachine.error.value) {
    message.error(beautifyError(updateMachine.error.value));
  } else {
    message.success(updateMachine.response.value?.message!);
    updateMachine.dialog.value = false;
    readMachine.start();
  }
};

const deleteItem = async () => {
  // console.log(selectedItem.value);
  await deleteMachine.start('/store/' + subDomain.value + '/categories/' + selectedItem.value.id);
  if (deleteMachine.error.value) {
    message.error(beautifyError(deleteMachine.error.value));
  } else {
    message.success(deleteMachine.response.value?.message!);
    deleteMachine.dialog.value = false;
    readMachine.start();
  }
};

const categories = computed(() => getChilds(readMachine.response.value!, 0));

function getChilds(categories: Category[], parentId: number): Category[] {
  if (!categories) {
    return [];
  }
  return categories
    .filter((category) => category.parentId === parentId)
    .map((item) => ({ ...item, childs: getChilds(categories, item.id) }))
    .sort((a, b) => a.id - b.id);
}

const categoryOptions = [
  {
    label: 'Edit Category',
    key: 'Edit Category'
  },
  {
    label: 'Add Sub Category',
    key: 'Add Sub Category'
  },

  {
    label: 'Delete',
    key: 'Delete'
  }
];

const subCategoryOptions = [
  {
    label: 'Edit Category',
    key: 'Edit Category'
  },

  {
    label: 'Delete',
    key: 'Delete'
  }
];

onMounted(() => {
  readMachine.start();
});
</script>

<template>
  <div class="overview">
    <div class="block md:flex justify-between items-center my-5">
      <h4 class="mb-2 md:mb-0">All Categories</h4>

      <NButton
        type="primary"
        @click="
          addFormData.parentId = 0;
          createMachine.dialog.value = true;
        "
      >
        Add Parent Category
      </NButton>
    </div>

    <NEmpty
      class="mt-10"
      description="Nothing found!"
      v-if="!readMachine.loading.value && !readMachine.response.value?.length"
    >
    </NEmpty>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div v-for="category in categories" class="mr-4 border-1 p-4 mb-4 border-gray-200 bg-white">
        <div class="text-lg category-item">
          <span :class="{ 'text-green-600': category.isTop }">
            {{ category.order }}. {{ category.name }}
          </span>
          <n-dropdown
            trigger="click"
            placement="bottom-end"
            :show-arrow="true"
            :options="categoryOptions"
            @select="
              (key: string) => {
                handleActionClick(key, category);
              }
            "
          >
            <n-button quaternary size="small">
              <NIcon>
                <EllipsisVerticalOutline></EllipsisVerticalOutline>
              </NIcon>
            </n-button>
          </n-dropdown>

          <!-- <NButton
              type="default"
              quaternary
              size="small"
              @click="
                addFormData.parentId = category.id;
                createMachine.dialog.value = true;
              "
            >
              <NIcon>
                <AddOutline></AddOutline>
              </NIcon>
              <div class="ml-2">Subcategory</div>
            </NButton> -->
        </div>

        <div class="ml-4 mt-2">
          <div v-for="childCategory in category.childs" class="category-item mb-2 text-md mb-4">
            <div class="category-item flex items-center text-sm">
              <!-- <NIcon>
                <EllipseOutline></EllipseOutline>
              </NIcon> -->
              <div class="mx-1" :class="{ 'text-green-600': childCategory.isTop }">
                {{ childCategory.order }}. {{ childCategory.name }}
              </div>
              <n-dropdown
                trigger="click"
                placement="bottom-end"
                :show-arrow="true"
                :options="categoryOptions"
                @select="
                  (key: string) => {
                    handleActionClick(key, childCategory);
                  }
                "
              >
                <n-button quaternary size="small">
                  <NIcon>
                    <EllipsisVerticalOutline></EllipsisVerticalOutline>
                  </NIcon>
                </n-button>
              </n-dropdown>
            </div>

            <div class="ml-4 mt-2">
              <div
                v-for="childChildCategory in childCategory.childs"
                class="category-item mb-2 text-[12px]"
              >
                <div class="category-item flex items-center">
                  <!-- <NIcon>
                    <RadioButtonOffOutline></RadioButtonOffOutline>
                  </NIcon> -->
                  <div class="mx-1" :class="{ 'text-green-600': childChildCategory.isTop }">
                    {{ childChildCategory.order }}. {{ childChildCategory.name }}
                  </div>

                  <n-dropdown
                    trigger="click"
                    placement="bottom-end"
                    :show-arrow="true"
                    :options="subCategoryOptions"
                    @select="
                      (key: string) => {
                        handleActionClick(key, childChildCategory);
                      }
                    "
                  >
                    <n-button quaternary size="small">
                      <NIcon>
                        <EllipsisVerticalOutline></EllipsisVerticalOutline>
                      </NIcon>
                    </n-button>
                  </n-dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <NModal
      v-model:show="createMachine.dialog.value"
      preset="card"
      :title="addFormData.parentId === 0 ? `Add new category` : `Add Sub Category`"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <AForm @successSubmit="addItem" :formData="addFormData" :schema="addCategorySchema">
        <div class="space-y-2">
          <AFormInput label="Category Name" name="name" placeholder="Enter category name" />

          <AFormInput label="Meta Title" name="metaTitle" placeholder="Meta Title" />
          <AFormInput
            label="Meta Description"
            name="metaDescription"
            placeholder="Meta Description"
          />

          <AFormInputNumber label="Order" name="order" placeholder="Order" />

          <NCheckbox v-model:checked="addFormData.isTop" label="Top Category"></NCheckbox>

          <div class="mt-4">
            <NButton block type="primary" attr-type="submit" :loading="createMachine.loading.value">
              {{ addFormData.parentId === 0 ? `Add new category` : `Add Sub Category` }}
            </NButton>
          </div>
        </div>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Edit This Category"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->
      <AForm @successSubmit="saveChanges" :formData="selectedItem" :schema="editCategorySchema">
        <div class="space-y-2">
          <!-- {{ selectedItem }} -->
          <AFormInput label="Name" name="name" placeholder="Category Name" />
          <AFormInput label="Meta Title" name="metaTitle" placeholder="Meta Title" />
          <AFormInput
            label="Meta Description"
            name="metaDescription"
            placeholder="Meta Description"
          />

          <AFormInputNumber label="Order" name="order" placeholder="Order" />
          <NCheckbox v-model:checked="selectedItem.isTop" label="Top Category"></NCheckbox>

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
        Do you really want to delete <strong> {{ selectedItem.name }}?</strong>
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

.category-item button {
  visibility: hidden;
}

.category-item:hover > button {
  visibility: visible;
}
</style>
