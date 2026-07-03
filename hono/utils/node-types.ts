export type StoreInfo = {
  storeId: number;
  serverId: number;
  packageExpiry: string;
  name: string;
  subDomain: string;
  customDomain: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  logoUrl: string | null;
  brandColor: string | null;
  faviconUrl: string | null;
  currency: string;
  timezone: string;
  status: string;
};

export type JWTUser = {
  id: number;
  userType: 'Admin' | 'User' | 'Customer' | 'Guest';
  permissions: string[];
  ownedStores: Record<string, number>;
  storeInfo: StoreInfo | null;
};
