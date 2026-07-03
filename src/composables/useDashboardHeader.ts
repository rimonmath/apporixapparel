// composables/useCounter.ts
// import { onMounted, ref, shallowReactive } from 'vue';
import { useHost } from './useHost';
import { useRead } from './useRead';

// type SidebarData = {
//   All: number;
//   Pending: number;
//   Draft: number;
//   Published: number;
//   Archived: number;
// };

const { isKhudroshopHost } = useHost();

const getProileMacine = useRead<{ name: string }>(
  isKhudroshopHost ? '/user/profile/summary' : '/customer/profile/summary',
  true
);

export function useDashboardHeader() {
  return {
    getProileMacine
  };
}
