// composables/useCounter.ts
// import { onMounted, ref, shallowReactive } from 'vue';
import { useRead } from './useRead';

// type SidebarData = {
//   All: number;
//   Pending: number;
//   Draft: number;
//   Published: number;
//   Archived: number;
// };

const getProileMacine = useRead<{ name: string; userType: string }>(
  '/customer/profile/summary',
  true
);

export function useDashboardHeader() {
  return {
    getProileMacine
  };
}
