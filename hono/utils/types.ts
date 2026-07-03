export interface ErrorResponse {
  message?: string;
  code?: number;
  data?: Record<string, any> | null;
  error?: any[];
  success?: boolean;
  redirect?: string;
  [key: string]: any;
}

export type SuccessResponse = {
  message: string;
  redirect?: string;
  id?: number;
};

export type BillingCycle = 'Monthly' | 'Yearly';
export type StoreStatus = 'Draft' | 'Active' | 'Suspended';

export interface Package {
  id: number;
  name: string;
  description: string | null;
  monthlyOrdersLimit: number;
  storageLimitMb: number;
  monthlyChargeInUsd: number;
}

export type Store = {
  id: number;
  userId: number;
  packageId: number;
  packageExpiry: string; // "YYYY-MM-DD"
  billingCycle: BillingCycle;
  name: string;
  subDomain: string;
  customDomain: string | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  logoUrl: string | null;
  faviconUrl: string | null;
  currency: string;
  timezone: string;
  status: StoreStatus;
  package: Package;
};

export type SigninResponse = SuccessResponse & {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  userType: 'User' | 'Admin';
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  parentId: number;
  name: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  order: number;
  isTop: boolean;
  createdAt: string;
  updatedAt: string;
  childs?: Category[];
};

export type AttributeValue = {
  id: string;
  attributeId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type Attribute = {
  id: string;
  name: string;
  attributeValues: AttributeValue[];
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: number;
  productId: number;
  url: string;
};

export type ProductCategory = {
  productId: number;
  categoryId: number;
  category: Category;
};

export type Variant = {
  id: number;
  productId: number;
  name: string;
  values: string[];
};

export type VariantCombination = Record<string, string>;

export type SKUResult = {
  sku: string;
  variant: VariantCombination;
};

export type Pricing = {
  buyPrice: string;
  createdAt: string; // ISO date string
  productId: number;
  quantity: number;
  regularPrice: string;
  salePrice: string;
  serverId: number;
  shippingRate: string;
  storeId: number;
  updatedAt: string; // ISO date string
  variation: string;
  weight: string;
};

export type Product = {
  id: number;
  title: string;
  description: string | null;
  vendor: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  currency: string; // e.g., 'BDT'
  taxRate: string;
  isActive?: boolean;
  status: 'Draft' | 'Published' | 'Archived'; // match your pgEnum values
  isFeatured: boolean;
  isOnSale: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO
  categories?: ProductCategory[];
  categoryIds?: number[];
  images?: ProductImage[];
  variants?: any[];
  pricings?: Pricing[];
};

export type FormErrors = Record<string, string>;

export type DeliveryOption = {
  id: number;
  name: string;
  charge: string;
  weightLimit: string;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  id: number;
  userId: number;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: number;
  code: string;
  type: 'Flat' | 'Percentage';
  discount: number;
  minPurchase: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usagePerUser: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};
