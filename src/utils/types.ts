import type z from 'zod';

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

export type User = {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  gender: 'Male' | 'Female' | 'Other' | 'Not Specified';
  userType: 'User' | 'Admin';
  isEmailVerified: boolean;
  emailVerificationCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  referralReward: number;
  referredUserId: number;
  referredUsers: User[];
  storesCount: number;
  referredStoresCount: number;
  referredStores: Store[];
};

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
  showNextToLogo: boolean;
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
  categoryCount: number;
  productCount: number;
  thisMonthOrdersCount: number;
  totalOrdersCount: number;
  totalProductImagesCount: number;
  user: User;
  brandColor: string;
  layout: string;
};

export type SigninResponse = SuccessResponse & {
  accessToken: string;
  refreshToken: string;
  customerToken: string;
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
  image?: string;
};

export type Product = {
  id: number;
  title: string;
  description: string | null;
  vendor: string | null;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  baseBuyPrice: string; // numeric stored as string
  basePrice: string;
  baseSalePrice: string;
  baseShippingRate: string;
  baseWeight: string;
  baseQuantity: number;
  currency: string; // e.g., 'BDT'
  taxRate: string;
  isActive: boolean;
  status: 'Draft' | 'Published' | 'Archived'; // match your pgEnum values
  isFeatured: boolean;
  isOnSale: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO
  categories: ProductCategory[];
  categoryIds: number[];
  images: ProductImage[];
  variants: any[];
  pricings: Pricing[];
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

//  orderId: integer('order_id')
//       .references(() => Orders.id)
//       .notNull(),
//     productId: integer('product_id')
//       .references(() => Products.id)
//       .notNull(),
//     variation: varchar('variation', { length: 255 }).notNull(),
//     price: decimal('price', { precision: 12, scale: 2 }).notNull(),
//     quantity: integer('quantity').notNull(),

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  variation: string;
  image: string;
  price: number;
  quantity: number;
};

export type OrderStatusHistory = {
  id: number;
  orderId: number;
  status: string;
  note: string;
  createdAt: string;
};

export type Order = {
  id: number;
  userId: number;
  user: User;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  shippingAddressId: number;
  billingAddressId: number;
  paymentMethod: string;
  transactionId: string;
  paymentHistory: {
    transactionId: string;
    amount: number;
    status: string;
    paymentMethod: string;
    paymentMeta: string;
    createdAt: string;
  }[];
  paymentMeta: string;
  customerNote: string;
  adminNote: string;
  subtotal: number;
  couponId: number;
  coupon: Coupon;
  couponDiscount: number;
  taxCharge: number;
  shippingCharge: number;
  deliveryOption: string;
  deliveryCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  orderStatusHistory: OrderStatusHistory[];
};

export type Carousel = {
  id: number;
  url: string;
  description: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
};

export type Page = {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  isPublished: string;
};

export type BakirKhataItem = {
  id: number;
  entryDate: string | null;
  customerName: string;
  amount: string;
  reason: string;
  note: string;
  returns: {
    returnDate: string | null;
    returnAmount: string;
    note?: string;
  }[];
  totalReturns: string;
};

export type IncomeExpenseItem = {
  id: number;
  entryDate: string | null;
  amount: string;
  note: string;
  type: 'Income' | 'Expense';
};

export type Dealer = {
  id: number;
  name: string;
  description: string;
};

export type DealerStatement = {
  id: number;
  entryDate: string | null;
  amount: string;
  note: string;
  type: 'Credit' | 'Debit';
  dealerId: number;
  dealer: Dealer;
};

export type Archives = {
  id: number;
  dealerName: string;
  dealerId: number;
  entryDate: string;
  data: {
    entryDate: string;
    type: 'Debit' | 'Credit';
    amount: string;
    note: string;
  }[];
};
