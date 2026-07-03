// composables/useCounter.ts
// import { onMounted, ref, shallowReactive } from 'vue';
import { shallowRef } from 'vue';
import { useRead } from './useRead';
import type { Store } from '@/utils/types';

// type SidebarData = {
//   All: number;
//   Pending: number;
//   Draft: number;
//   Published: number;
//   Archived: number;
// };

const storeInfoMachine = useRead<Store>(``, true);
const subDomain = shallowRef('');

storeInfoMachine.customStart = function () {
  const path = window.location.pathname.split('/');
  subDomain.value = path[2];
  // console.log(path);
  // console.log(`/store/${subDomain.value}/info`);
  return storeInfoMachine.start(`/store/${subDomain.value}/info`);
};

export function useStoreInfo() {
  return {
    storeInfoMachine,
    subDomain
  };
}
