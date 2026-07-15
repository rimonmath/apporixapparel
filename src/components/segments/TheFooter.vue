<script setup>
import { useHomeHeader } from '@/composables/useHomeHeader';
import { getUploadedUrl, replaceSpaces } from '@/utils/functions';
import {
  LocationOutline,
  LogoFacebook,
  LogoInstagram,
  LogoWhatsapp,
  LogoYoutube,
  Mail,
  PhonePortrait
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { onMounted } from 'vue';

const { categoriesMachine, categories, pagesMachine, storeDetailsMachine } = useHomeHeader();

onMounted(() => {
  categoriesMachine.start();
  pagesMachine.start();
  storeDetailsMachine.start();
});
</script>
<template>
  <footer class="bg-gray-900 text-gray-300 py-10">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-3">
        <div>
          <h3 class="mt-5 flex items-center gap-2 justify-left">
            <img
              v-if="storeDetailsMachine.response.value?.logoUrl"
              :src="getUploadedUrl(storeDetailsMachine.response.value?.logoUrl || '')"
              alt="Logo"
              class="max-h-[20px]"
            />

            <span class="brand-color">
              {{ storeDetailsMachine.response.value?.name || 'Khudroshop' }}</span
            >
          </h3>
          <p class="text-gray-400 text-sm leading-loose text-left mt-1">
            {{ storeDetailsMachine.response.value?.metaTitle }}
          </p>

          <p class="text-gray-400 text-sm leading-loose text-left mt-4">
            <span class="flex items-center gap-2">
              <NIcon>
                <LocationOutline />
              </NIcon>
              {{ storeDetailsMachine.response.value?.address }}
            </span>
            <span class="flex items-center gap-2">
              <NIcon>
                <Mail />
              </NIcon>
              {{ storeDetailsMachine.response.value?.supportEmail }}
            </span>
            <span class="flex items-center gap-2">
              <NIcon>
                <PhonePortrait />
              </NIcon>
              {{ storeDetailsMachine.response.value?.supportPhone }}
            </span>
          </p>
        </div>
        <div>
          <h3 class="text-left mt-5">Usefull Link</h3>

          <ul class="mt-4 text-left">
            <li v-for="page in pagesMachine.response.value">
              <SmartLink :to="`/pages/${page.id}/${replaceSpaces(page.name)}`">{{
                page.name
              }}</SmartLink>
            </li>
            <li>
              <SmartLink to="/privacy">Privacy Policy</SmartLink>
            </li>
            <li>
              <SmartLink to="/terms">Terms of Service</SmartLink>
            </li>
            <!-- <li>
              <SmartLink to="/return">Return Policy</SmartLink>
            </li> -->
          </ul>
        </div>
        <div>
          <h3 class="mt-5">Connect</h3>
          <p class="mt-5">
            Follow us on social media for updates, insights, <br />
            and creative inspiration.
          </p>

          <div class="flex items-center gap-4 justify-center text-xl mt-5">
            <a :href="storeDetailsMachine.response.value?.facebook" target="_blank">
              <NIcon>
                <LogoFacebook />
              </NIcon>
            </a>
            <a :href="storeDetailsMachine.response.value?.instagram" target="_blank">
              <NIcon>
                <LogoInstagram />
              </NIcon>
            </a>

            <a :href="storeDetailsMachine.response.value?.youtube" target="_blank">
              <NIcon>
                <LogoYoutube />
              </NIcon>
            </a>
          </div>

          <div
            class="mt-2 inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            <NIcon>
              <LogoWhatsapp />
            </NIcon>

            <span class="text-gray-300 text-xs">Support 24/7</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Divider + Copyright row with dynamic year and legal micro links -->
      <div
        class="border-t border-gray-800/70 mt-10 pt-7 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
      >
        <div class="text-[12px] text-gray-400">
          <!-- dynamic copyright year with JavaScript -->
          <p class="flex items-center gap-1">
            &copy;
            <span id="currentYear"></span>
            {{ storeDetailsMachine.response.value?.name || 'Khudroshop' }}, 2026. All rights
            reserved.
          </p>
        </div>
        <!-- optional small design badge / back to top -->
        <div class="flex items-center gap-2">
          <span class="text-gray-500 text-[11px]">
            Powered by
            <a href="https://apporixworld.com" target="_blank" class="text-white">Apporixworld</a>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
footer h3:not(.rich-text h3) {
  text-transform: uppercase;
  /* text-align: center; */
  color: #bbb9b9;
}

footer li {
  margin: 4px auto;
}

footer li a {
  color: #99a1af;
}

footer li a:hover {
  color: #fff;
}

.brand-color {
  color: var(--primary-500);
}
</style>
