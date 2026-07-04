// composables/useCounter.ts
import { useRead } from './useRead';
import { useStoreInfo } from './useStoreInfo';

type SidebarData = {
  All: number;
  Placed: number;
  Processing: number;
  Confirmed: number;
  Packed: number;
  Shipped: number;
  Delivered: number;
  'Out For Delivery': number;
  Cancelled: number;
  Returned: number;
};

// const { subDomain } = useStoreInfo();

const ordersCountMachine = useRead<SidebarData, true>(`/store/orders/count`, true);

ordersCountMachine.customStart = function () {
  // const path = window.location.pathname.split('/');
  // subDomain.value = path[2];
  return ordersCountMachine.start(`/store/orders/count`);
};

export function useStoreSidebar() {
  return {
    ordersCountMachine
  };
}
