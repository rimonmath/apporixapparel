<script setup lang="ts">
import { NAlert, NCard, NIcon, NModal, NPopconfirm, NSpace, NTable, useMessage } from 'naive-ui';
import { useDashboardHeader } from '@/composables/useDashboardHeader';
import {
  AddOutline,
  AppsOutline,
  CallOutline,
  CreateOutline,
  LocationOutline,
  NavigateOutline,
  TrashOutline
} from '@vicons/ionicons5';
import { useCreate } from '@/composables/useCreate';
import { addEditAddressSchema, addStoreSchema, updateProfileSchema } from '@/utils/schemas';
import AForm from '@/components/form/AForm.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
// import { SigninResponse } from '@/utils/types';
import type { Address, Store, SuccessResponse, User } from '@/utils/types.js';
import { computed, onMounted, ref, shallowReactive } from 'vue';
import { useRead } from '@/composables/useRead';
import { beautifyError } from '@/utils/functions';
import { useStoreInfo } from '@/composables/useStoreInfo';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import type AFormSelectVue from '@/components/form/AFormSelect.vue';
const { getProileMacine } = useDashboardHeader();

// SigninResponse

const message = useMessage();

const readMachine = useRead<User>('/user/profile', true);
const newAddressMachine = useCreate<SuccessResponse>('/user/profile/addresses', true);
const updateAddressMachine = useUpdate<SuccessResponse>(true);
const updateProfileMachine = useUpdate<SuccessResponse>(true);
const deleteAddressMachine = useDelete<SuccessResponse>(true);

const selectedAddress = ref<Address | null>(null);

onMounted(() => {
  readMachine.start();
});

const newAddressForm = shallowReactive({
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'Bangladesh',
  latitude: '',
  longitude: ''
});

const resetNewAddressForm = () => {
  Object.assign(newAddressForm, {
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
    latitude: '',
    longitude: ''
  });
};

const addNewAddress = async () => {
  if (newAddressMachine.error.value) {
    message.error(beautifyError(newAddressMachine.error.value));
    return;
  }
  await newAddressMachine.start(newAddressForm);
  resetNewAddressForm();
  message.success(newAddressMachine.response.value!.message);
  newAddressMachine.dialog.value = false;
  readMachine.start();
};

const updateAddress = async () => {
  if (!selectedAddress.value) return;
  await updateAddressMachine.start(
    '/user/profile/addresses/' + selectedAddress.value.id,
    selectedAddress.value
  );
  if (updateAddressMachine.error.value) {
    message.error(beautifyError(updateAddressMachine.error.value));
    return;
  }

  message.success(updateAddressMachine.response.value!.message);
  updateAddressMachine.dialog.value = false;
  // readMachine.start();
};

const deleteAddress = async (id: number) => {
  if (deleteAddressMachine.error.value) {
    message.error(beautifyError(deleteAddressMachine.error.value));
    return;
  }
  await deleteAddressMachine.start('/user/profile/addresses/' + id);
  if (deleteAddressMachine.error.value) {
    message.error(beautifyError(deleteAddressMachine.error.value));
    return;
  }

  message.success(deleteAddressMachine.response.value!.message);
  deleteAddressMachine.dialog.value = false;
  readMachine.start();
};

const updateFormData = shallowReactive<{ name: string; gender: string | null }>({
  name: '',
  gender: null
});

const initUpdateProfile = () => {
  if (!readMachine.response.value) return;
  updateFormData.name = readMachine.response.value?.name;
  updateFormData.gender = readMachine.response.value?.gender;
  updateProfileMachine.dialog.value = true;
};

const updateProfile = async () => {
  if (updateProfileMachine.error.value) {
    message.error(beautifyError(updateProfileMachine.error.value));
    return;
  }
  await updateProfileMachine.start('/user/profile', updateFormData);
  if (updateProfileMachine.error.value) {
    message.error(beautifyError(updateProfileMachine.error.value));
    return;
  }

  message.success(updateProfileMachine.response.value!.message);
  updateProfileMachine.dialog.value = false;
  readMachine.start();
};
</script>

<template>
  <div class="container">
    <div class="px-4">
      <div class="mt-5">
        <h4>My Profile</h4>
      </div>

      <NCard class="mt-4" title="Personal Information">
        <template #header-extra>
          <NButton @click="initUpdateProfile">Edit</NButton>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-5 items-center">
          <div class="flex items-center gap-5">
            <div class="profile-photo">{{ readMachine.response.value?.name?.[0] }}</div>
          </div>
          <div>
            <div>Name</div>
            <div class="mt-2">
              <strong>{{ readMachine.response.value?.name }}</strong>
            </div>
          </div>

          <div>
            <div>Email</div>
            <div class="mt-2">
              <strong>{{ readMachine.response.value?.email }}</strong>
            </div>
          </div>

          <div>
            <div>Email Verification</div>
            <div class="mt-2">
              <strong>
                {{ readMachine.response.value?.isEmailVerified ? 'Verified' : 'Not Verified' }}
              </strong>
            </div>
          </div>

          <div>
            <div>Gender</div>
            <div class="mt-2">
              <strong>{{ readMachine.response.value?.gender }}</strong>
            </div>
          </div>
        </div>
      </NCard>

      <NCard class="mt-4" title="Addresses">
        <template #header-extra>
          <NButton @click="newAddressMachine.dialog.value = true">Add Address</NButton>
        </template>
        <div
          v-for="address in readMachine.response.value?.addresses"
          :key="address.id"
          class="my-4"
        >
          <div
            @click="selectedAddress = address"
            class="rounded-md grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-5 border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div>
              <p class="flex items-center gap-2">
                <NIcon>
                  <NavigateOutline />
                </NIcon>
                {{ address.name }}
              </p>
              <p class="flex items-center gap-2">
                <NIcon>
                  <CallOutline />
                </NIcon>
                {{ address.phone }}
              </p>
            </div>
            <div>
              <div class="flex items-start">
                <p class="mt-1">
                  <NIcon>
                    <LocationOutline />
                  </NIcon>
                </p>

                <p class="ml-2">
                  {{ address.addressLine1 }} {{ address.addressLine2 }},
                  {{ address.city }}
                  <br />
                  {{ address.postalCode }}, {{ address.country }}
                </p>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <NButton
                size="small"
                @click="
                  selectedAddress = address;
                  updateAddressMachine.dialog.value = true;
                "
                title="Edit"
                type="primary"
                ghost
              >
                <NIcon>
                  <CreateOutline />
                </NIcon>
              </NButton>

              <NPopconfirm
                positive-text="Yes"
                negative-text="No"
                @positive-click="deleteAddress(address.id)"
              >
                <template #trigger>
                  <NButton size="small" title="Delete" type="error" ghost>
                    <NIcon>
                      <TrashOutline />
                    </NIcon>
                  </NButton>
                </template>
                Do you really want to delete this address? This can not be undone.
              </NPopconfirm>
            </div>
          </div>
        </div>
      </NCard>
    </div>

    <NModal
      v-model:show="newAddressMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Add New Address"
      :bordered="false"
      :style="{ width: '600px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        @successSubmit="addNewAddress"
        :formData="newAddressForm"
        :schema="addEditAddressSchema"
      >
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AFormInput name="name" placeholder="Home1 / Office 2" label="Name" />
            <AFormInput name="phone" placeholder="Phone" label="Phone" />
          </div>
          <AFormInput name="addressLine1" placeholder="Address Line 1" label="Address Line 1" />
          <AFormInput
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            label="Address Line 2 (Optional)"
          />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
            <AFormInput name="city" placeholder="City" label="City" />
            <AFormInput name="postalCode" placeholder="Postal Code" label="Postal Code" />
            <AFormInput name="country" placeholder="Country" label="Country" />
          </div>

          <NButton type="primary" block attr-type="submit"> Add Address </NButton>
        </div>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateAddressMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Update Address"
      :bordered="false"
      :style="{ width: '600px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        v-if="selectedAddress"
        @successSubmit="updateAddress"
        :formData="selectedAddress"
        :schema="addEditAddressSchema"
      >
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AFormInput name="name" placeholder="Home1 / Office 2" label="Name" />
            <AFormInput name="phone" placeholder="Phone" label="Phone" />
          </div>
          <AFormInput name="addressLine1" placeholder="Address Line 1" label="Address Line 1" />
          <AFormInput
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            label="Address Line 2 (Optional)"
          />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
            <AFormInput name="city" placeholder="City" label="City" />
            <AFormInput name="postalCode" placeholder="Postal Code" label="Postal Code" />
            <AFormInput name="country" placeholder="Country" label="Country" />
          </div>

          <NButton type="primary" block attr-type="submit"> Save Changes </NButton>
        </div>
      </AForm>
    </NModal>

    <NModal
      v-model:show="updateProfileMachine.dialog.value"
      class="custom-card"
      preset="card"
      title="Update Profile"
      :bordered="false"
      :style="{ width: '400px' }"
    >
      <!-- <template #header-extra> Oops! </template> -->

      <AForm
        v-if="updateProfileMachine.dialog.value"
        @successSubmit="updateProfile"
        :formData="updateFormData"
        :schema="updateProfileSchema"
      >
        <div>
          <AFormInput name="name" placeholder="Home1 / Office 2" label="Name" />
          <AFormSelect
            name="gender"
            placeholder="Gender"
            label="Gender"
            :options="[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' }
            ]"
          />
          <NButton type="primary" block attr-type="submit"> Save Changes </NButton>
        </div>
      </AForm>
    </NModal>
  </div>
</template>

<style scoped>
.profile-photo {
  width: 80px;
  height: 80px;
  border-radius: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ccc;
  font-size: 30px;
}
</style>
