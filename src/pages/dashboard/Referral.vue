<script setup lang="ts">
import AForm from '@/components/form/AForm.vue';
import AFormDatePicker from '@/components/form/AFormDatePicker.vue';
import AFormInput from '@/components/form/AFormInput.vue';
import { useCreate } from '@/composables/useCreate';
import { addIncomeExpenseSchema } from '@/utils/schemas';
import {
  NButton,
  NCard,
  NEmpty,
  NIcon,
  NInput,
  NModal,
  NPagination,
  NPopover,
  NSelect,
  NSkeleton,
  NTable,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import { computed, onMounted, shallowReactive, shallowRef, watch } from 'vue';
import { beautifyError, copyToClipboard } from '@/utils/functions';
import { useRead } from '@/composables/useRead';
import type { IncomeExpenseItem, User } from '@/utils/types';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowBackOutline,
  ArrowForwardOutline,
  CopyOutline,
  LogoFacebook,
  LogoLinkedin,
  LogoTwitter,
  LogoWhatsapp,
  RefreshOutline,
  SearchOutline,
  ShareSocialOutline
} from '@vicons/ionicons5';
import { useUpdate } from '@/composables/useUpdate';
import { useDelete } from '@/composables/useDelete';
import IETable from './_ie/IETable.vue';
import AFormSelect from '@/components/form/AFormSelect.vue';
import XLogo from '@/components/icons/XLogo.vue';

const SummaryMachine = useRead<{ summary: User; referredUsers: User[] }>(
  '/user/referral/summary',
  true
);

const activeTab = shallowRef('users');

const referralLink = computed(
  () => `https://khudroshop.com/r/REF-${SummaryMachine.response?.value?.summary.id}`
);

const facebookShareUrl = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink.value)}`
);

const xShareUrl = computed(
  () =>
    `https://x.com/intent/tweet?text=${encodeURIComponent('Khudroshop')}&url=${encodeURIComponent(referralLink.value)}`
);

const whatsappShareUrl = computed(
  () =>
    `https://api.whatsapp.com/send?text=${encodeURIComponent('Khudroshop' + ' ' + referralLink.value)}`
);

const linkedinShareUrl = computed(
  () =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink.value)}`
);

const canShare = shallowRef(!!navigator.share);

const shareReferralLink = async () => {
  if (!canShare.value) return;

  try {
    await navigator.share({
      title: 'Khudroshop',
      text: 'Check out this amazing website!',
      url: referralLink.value
    });
  } catch (err) {
    console.log('Share cancelled or unsupported:', err);
  }
};

const message = useMessage();
const copyReferralLink = async () => {
  await copyToClipboard(referralLink.value);
  message.success('Referral link copied to clipboard');
};

const policyDialog = shallowRef(false);

onMounted(() => {
  SummaryMachine.start();
});
</script>

<template>
  <div class="container py-2">
    <!-- <h4>Bakir Khata App</h4> -->
    <!-- <NCard class="mt-5"> -->

    <NCard>
      <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr] gap-4">
        <div>
          <p>
            <strong>Referral Reward</strong>
          </p>
          <p>{{ SummaryMachine.response?.value?.summary.referralReward }}</p>
        </div>
        <div>
          <p>
            <strong>Referral Link</strong>
          </p>
          <div class="flex items-center gap-2">
            <p>{{ referralLink }}</p>
            <NButton
              size="tiny"
              type="primary"
              ghost
              title="Copy Referral Link"
              @click="copyReferralLink"
            >
              <NIcon>
                <CopyOutline />
              </NIcon>
            </NButton>

            <NButton
              size="tiny"
              type="primary"
              ghost
              title="Share Referral Link"
              @click="shareReferralLink"
              v-if="canShare"
            >
              <NIcon>
                <ShareSocialOutline />
              </NIcon>
            </NButton>
            <template v-else>
              <NPopover trigger="click" raw :show-arrow="false">
                <template #trigger>
                  <NButton size="tiny" type="primary" ghost title="Share Referral Link">
                    <NIcon>
                      <ShareSocialOutline />
                    </NIcon>
                  </NButton>
                </template>
                <div
                  style="width: 200px; transform-origin: inherit; border-radius: 5px"
                  class="p-5 bg-white"
                >
                  <div>Share on</div>
                  <a
                    :href="facebookShareUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                  >
                    <NIcon>
                      <LogoFacebook />
                    </NIcon>

                    Facebook
                  </a>

                  <a
                    :href="xShareUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                  >
                    <NIcon>
                      <XLogo />
                    </NIcon>

                    X (Twitter)
                  </a>
                  <a
                    :href="whatsappShareUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                  >
                    <NIcon>
                      <LogoWhatsapp />
                    </NIcon>

                    WhatsApp
                  </a>
                  <a
                    :href="linkedinShareUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 hover:bg-gray-100 p-2 my-1"
                  >
                    <NIcon>
                      <LogoLinkedin />
                    </NIcon>

                    LinkedIn
                  </a>
                </div>
              </NPopover>
            </template>
          </div>
        </div>
        <div>
          <p>
            <strong>Referral Policy</strong>
          </p>
          <p>
            <NButton type="primary" size="small" ghost text @click="policyDialog = true">
              View Policy
            </NButton>
          </p>
        </div>
      </div>
    </NCard>

    <NTabs type="line" animated v-model:value="activeTab">
      <NTabPane name="users" tab="Referred Users" class="my-4">
        <NTable size="small">
          <thead>
            <tr>
              <th>SL</th>
              <th>Name</th>
              <th>Email</th>
              <th>Stores</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in SummaryMachine.response?.value?.referredUsers">
              <td>{{ index + 1 }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.storesCount }}</td>
            </tr>
          </tbody>
        </NTable>
      </NTabPane>
      <NTabPane name="stores" tab="Referred Stores" class="my-4">
        <NTable size="small">
          <thead>
            <tr>
              <th>SL</th>
              <th>Store Name</th>
              <th>Owner Name</th>
              <th>Sub Domain</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(store, i) in SummaryMachine.response?.value?.summary.referredStores">
              <td>{{ i + 1 }}</td>
              <td>{{ store.name }}</td>
              <td>{{ store.user.name }}</td>
              <td>
                <a
                  :href="`http://${store.subDomain}.khudroshop.com`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ store.subDomain }}.khudroshop.com
                </a>
              </td>
              <td>{{ store.status }}</td>
            </tr>
          </tbody>
        </NTable>
      </NTabPane>

      <NTabPane name="withdrawals" tab="Withdrawals" class="my-4">
        <NCard>
          <div class="flex justify-between">
            <div>Minimum Withdrawal Amount: 500</div>

            <NButton type="primary" size="small">Withdraw Now</NButton>
          </div>
          <hr class="my-2" />
          <NEmpty description="No withdrawals found" />
        </NCard>
      </NTabPane>
    </NTabs>

    <NModal
      v-model:show="policyDialog"
      class="custom-card"
      preset="card"
      title="Khudroshop Referral Policy"
      :bordered="false"
      :style="{ width: '500px' }"
    >
      <p>
        You will earn rewards when a user you referred creates a store and successfully publishes it
        with an active subscription plan of at least <strong>3 months</strong>. For each store’s
        <strong>first-time subscription</strong>, you will receive
        <strong>500 reward points</strong>.
      </p>

      <p class="my-2">
        Reward points can be withdrawn once your total balance reaches a minimum of
        <strong>500 points</strong>.
      </p>

      <p>
        Please note that we reserve the right to update, modify, or change this reward policy at any
        time without prior notice. Any changes will take effect immediately upon being published.
      </p>

      <div class="text-right mt-5">
        <NButton type="primary" @click="policyDialog = false">Close</NButton>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.stat-table th,
.stat-table td {
  padding: 4px;
}
</style>
