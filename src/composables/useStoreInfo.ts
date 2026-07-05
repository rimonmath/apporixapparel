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

const storeInfoMachine = useRead<Store>(`/store/info`, true);

export function useStoreInfo() {
  return {
    storeInfoMachine
  };
}
