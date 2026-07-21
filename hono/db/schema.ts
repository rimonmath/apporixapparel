import {
  integer,
  pgTable,
  varchar,
  timestamp,
  text,
  boolean,
  date,
  pgEnum,
  json,
  index,
  unique,
  jsonb,
  real,
  numeric,
  primaryKey,
  decimal
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import 'dotenv/config';

export const genderEnum = pgEnum('gender1', ['Male', 'Female', 'Other', 'Not Specified']);
export const userTypesEnum = pgEnum('user_type', ['Admin', 'User', 'Customer']);
export const productStatusEnum = pgEnum('product_status', ['Draft', 'Published', 'Archived']);
export const couponTypeEnum = pgEnum('coupon_type', ['Percentage', 'Flat']);
export const incomeOrExpenseTypeEnum = pgEnum('income_or_expense_type', ['Income', 'Expense']);
export const dealerStatementTypeEnum = pgEnum('dealer_statement_type', ['Debit', 'Credit']);

export const paymentStatusEnum = pgEnum('payment_status_enum', [
  'Unpaid',
  'Pending',
  'Partially Paid',
  'Paid',
  'Failed',
  'Refund Requested',
  'Partially Refunded',
  'Refunded',
  'Refund Cancelled'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Return Approved',
  'Return Rejected',
  'Return Received',
  'Returned',
  'Refunded',
  'Failed'
]);

const commonFields = {
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true
  })
    .defaultNow()
    .notNull()
};

export const Users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 99 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  permissions: json('permissions').$type<string[]>().default([]),
  name: varchar('name', { length: 256 }).notNull(),
  gender: genderEnum('gender').default('Not Specified').notNull(),
  emailVerificationCode: varchar('email_verification_code', { length: 6 }).default(''),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  userType: userTypesEnum('user_type').default('User').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  referredUserId: integer('referred_user_id').default(0),
  referralReward: integer('referral_reward').default(0),
  ...commonFields
});

export const StoreSettings = pgTable('stores', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 256 }).notNull(),
  showNextToLogo: boolean('show_next_to_logo').default(true).notNull(),
  subDomain: varchar('sub_domain', { length: 100 }).notNull().unique(),
  customDomain: varchar('custom_domain', { length: 256 }).unique(),
  metaTitle: varchar('meta_title', { length: 255 }).default(''),
  metaDescription: varchar('meta_description', { length: 255 }).default(''),
  metaKeywords: text('meta_keywords').array().default([]),
  logoUrl: varchar('logo_url', { length: 255 }),
  brandColor: varchar('brand_color', { length: 20 }).default('#009edb'),
  faviconUrl: varchar('favicon_url', { length: 255 }),
  currency: varchar('currency', { length: 10 }).notNull().default('BDT'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('Asia/Dhaka'),
  address: text('address').default('Default Location, Dhaka'),
  supportEmail: varchar('support_email', { length: 99 }).default('support@yourdomain.com'),
  supportPhone: varchar('support_phone', { length: 20 }).default('+88017xxxxxxxx'),
  facebook: varchar('facebook', { length: 255 }).default('https://facebook.com'),
  instagram: varchar('instagram', { length: 255 }).default('https://instagram.com'),
  whatsapp: varchar('whatsapp', { length: 255 }).default('+88017xxxxxxxx'),
  youtube: varchar('youtube', { length: 255 }).default('https://youtube.com'),
  ...commonFields
});

export const Categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  parentId: integer('parent_id').default(0),
  name: varchar('name', { length: 256 }).notNull(),
  thumbnail: varchar('thumbnail', { length: 100 }),
  metaTitle: varchar('meta_title', { length: 255 }).default(''),
  metaDescription: text('meta_description').default(''),
  order: integer('order').default(0),
  isTop: boolean('is_top').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...commonFields
});

export const Attributes = pgTable('attributes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  name: varchar('name', { length: 100 }).notNull(),
  ...commonFields
});

export const AttributeValues = pgTable('attribute_values', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  attributeId: integer('attribute_id')
    .references(() => Attributes.id)
    .notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  ...commonFields
});

export const Products = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').default(''),
  vendor: varchar('vendor', { length: 100 }).default(''),
  tags: text('tags').array().default([]),
  metaTitle: varchar('meta_title', { length: 255 }).default(''),
  metaDescription: text('meta_description').default(''),
  currency: varchar('currency', { length: 3 }).default('BDT'), // currency code
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0.00'), // % tax
  status: productStatusEnum('status').default('Draft').notNull(),
  isFeatured: boolean('is_featured').default(false),
  isOnSale: boolean('is_on_sale').default(false),
  ...commonFields
});

export const ProductImages = pgTable('product_images', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  productId: integer('product_id')
    .references(() => Products.id)
    .notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  ...commonFields
});

export const ProductCategories = pgTable('product_categories', {
  productId: integer('product_id')
    .references(() => Products.id)
    .notNull(),
  categoryId: integer('category_id')
    .references(() => Categories.id)
    .notNull(),
  ...commonFields
});

export const ProductVariants = pgTable('product_variants', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  productId: integer('product_id')
    .references(() => Products.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  values: text('values').array().default([]),
  ...commonFields
});

export const ProductPricings = pgTable('product_pricings', {
  productId: integer('product_id')
    .references(() => Products.id)
    .notNull(),
  variation: varchar('variation', { length: 255 }).notNull(),
  image: varchar('image', { length: 255 }),
  buyPrice: numeric('buy_price', { precision: 10, scale: 2 }).default('0.00'),
  regularPrice: numeric('regular_price', { precision: 10, scale: 2 }).default('0.00'),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }).default('0.00'),
  shippingRate: numeric('shipping_rate', { precision: 10, scale: 2 }).default('0.00'),
  weight: numeric('weight', { precision: 10, scale: 2 }).default('0.00'),
  quantity: integer('quantity').default(0),
  ...commonFields
});

export const UserAddresses = pgTable('user_addresses', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .references(() => Users.id)
    .notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 50 }),
  country: varchar('country', { length: 100 }).default('Bangladesh').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).default(`0.0`),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).default(`0.0`),
  ...commonFields
});

// export const StoreOrderCounters = pgTable('store_order_counters', {
//   storeId: integer('store_id')
//     .references(() => Stores.id, { onDelete: 'cascade' })
//     .primaryKey(),
//   lastNumber: integer('last_number').notNull().default(0)
// });

export const Coupons = pgTable(
  'coupons',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 50 }).notNull(),
    type: couponTypeEnum('type').notNull(),
    discount: decimal('discount', { precision: 10, scale: 2 }).notNull(),
    minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }),
    maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    usageLimit: integer('usage_limit'),
    usagePerUser: integer('usage_per_user'),
    isActive: boolean('is_active').default(true).notNull(),
    ...commonFields
  },
  (t) => [unique('coupon_code_unique').on(t.code)]
);

export const DeliveryOptions = pgTable('delivery_options', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
  charge: decimal('charge', { precision: 10, scale: 2 }).notNull(),
  weightLimit: decimal('weight_limit', { precision: 10, scale: 2 }).notNull(),
  ...commonFields
});

export const Orders = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .references(() => Users.id)
    .notNull(),
  shippingAddressId: integer('shipping_address_id')
    .references(() => UserAddresses.id)
    .notNull(),
  billingAddressId: integer('billing_address_id')
    .references(() => UserAddresses.id)
    .notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // COD, Bkash, Nagad. ///
  transactionId: varchar('transaction_id', { length: 150 }),
  paymentMeta: jsonb('payment_meta').default('{}'),
  customerNote: varchar('customer_note', { length: 255 }).default(''),
  adminNote: varchar('admin_note', { length: 255 }).default(''),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  couponId: integer('coupon_id').references(() => Coupons.id),
  couponDiscount: decimal('coupon_discount', { precision: 12, scale: 2 }).default('0'),
  taxCharge: decimal('tax_charge', { precision: 12, scale: 2 }).default('0'),
  shippingCharge: decimal('shipping_charge', { precision: 12, scale: 2 }).default('0'),
  deliveryOption: varchar('delivery_option', { length: 50 }).notNull(), // Inside Dhaka, Outside Dhaka, Pick Up. ///
  deliveryCharge: decimal('delivery_charge', { precision: 12, scale: 2 }).default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('Unpaid').notNull(),
  paymentHistory: jsonb('payment_history')
    .$type<
      {
        transactionId: string;
        amount: number;
        status: string;
        paymentMethod: string;
        paymentMeta: string;
        createdAt: string;
      }[]
    >()
    .notNull()
    .default([]),
  orderStatus: orderStatusEnum('order_status').default('Placed').notNull(),
  ...commonFields
});

export const CouponUsages = pgTable(
  'coupon_usages',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    couponId: integer('coupon_id')
      .references(() => Coupons.id)
      .notNull(),
    customerId: integer('customer_id')
      .references(() => Users.id)
      .notNull(),
    orderId: integer('order_id')
      .references(() => Orders.id)
      .notNull(),
    usedAt: timestamp('used_at').defaultNow().notNull(),
    ...commonFields
  },
  (t) => [unique('coupon_usage_unique').on(t.couponId, t.customerId, t.orderId)]
);

export const OrderItems = pgTable(
  'order_items',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer('order_id')
      .references(() => Orders.id)
      .notNull(),
    productId: integer('product_id')
      .references(() => Products.id)
      .notNull(),
    variation: varchar('variation', { length: 255 }).notNull(),
    image: varchar('image', { length: 255 }),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    ...commonFields
  },
  (t) => [index('order_items_order_idx').on(t.orderId)]
);

export const OrderStatusHistory = pgTable(
  'order_status_history',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer('order_id')
      .references(() => Orders.id)
      .notNull(),
    status: orderStatusEnum('status').notNull(),
    note: varchar('note', { length: 255 }).default(''),
    updatedBy: integer('updated_by').references(() => Users.id),
    ...commonFields
  },
  (t) => [index('order_status_history_order_idx').on(t.orderId)]
);

export const Carousels = pgTable('carousels', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  url: varchar('url', { length: 100 }).default(''),
  description: varchar('description', { length: 255 }).default(''),
  linkText: varchar('link_text', { length: 100 }).default(''),
  linkUrl: varchar('link_url', { length: 255 }).default(''),
  isActive: boolean('is_active').default(true).notNull(),
  ...commonFields
});

export const Pages = pgTable('pages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 256 }).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').default(''),
  image: varchar('image', { length: 256 }).notNull().default(''),
  isPublished: boolean('is_published').notNull().default(true),
  ...commonFields
});

// export const Dues = pgTable('dues', {
//   id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//   userId: integer('user_id')
//     .references(() => Users.id)
//     .notNull(),
//   customerName: varchar('customer_name', { length: 50 }).notNull(),
//   amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
//   reason: varchar('reason', { length: 255 }).notNull(),
//   note: varchar('note', { length: 255 }).default(''),
//   entryDate: date('entry_date').notNull(),
//   returns: jsonb('returns')
//     .$type<
//       {
//         returnDate: string;
//         returnAmount: string;
//         note?: string;
//       }[]
//     >()
//     .default([]),
//   totalReturns: decimal('total_returns', { precision: 10, scale: 2 }).default('0'),
//   ...commonFields
// });

// export const IncomeExpenses = pgTable('income_expenses', {
//   id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//   userId: integer('user_id')
//     .references(() => Users.id)
//     .notNull(),
//   type: incomeOrExpenseTypeEnum('type').notNull(),
//   amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
//   note: varchar('note', { length: 255 }).default(''),
//   entryDate: date('entry_date').notNull(),
//   ...commonFields
// });

// export const Dealers = pgTable('dealers', {
//   id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//   userId: integer('user_id')
//     .references(() => Users.id)
//     .notNull(),
//   name: varchar('name', { length: 50 }).notNull(),
//   description: varchar('description', { length: 255 }).default(''),
//   ...commonFields
// });

// export const DealerStatements = pgTable('dealer_statements', {
//   id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//   dealerId: integer('dealer_id')
//     .references(() => Dealers.id)
//     .notNull(),
//   userId: integer('user_id')
//     .references(() => Users.id)
//     .notNull(),
//   type: dealerStatementTypeEnum('type').notNull(),
//   amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
//   note: varchar('note', { length: 255 }).default(''),
//   entryDate: date('entry_date').notNull(),
//   ...commonFields
// });

// export const DSArchives = pgTable('ds_archives', {
//   id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//   userId: integer('user_id')
//     .references(() => Users.id)
//     .notNull(),
//   dealerId: integer('dealer_id'),
//   dealerName: varchar('dealer_name', { length: 100 }).notNull(),
//   data: jsonb('data')
//     .$type<
//       {
//         entryDate: string;
//         type: string;
//         amount: string;
//         note?: string;
//       }[]
//     >()
//     .notNull()
//     .default([]),
//   entryDate: date('entry_date').notNull(),
//   ...commonFields
// });

// /* =============================================================

//                       Relationships

// //==============================================================*/

export const usersRelations = relations(Users, ({ many }) => ({
  addresses: many(UserAddresses)
}));

// export const storesRelations = relations(Stores, ({ one, many }) => ({
//   user: one(Users, {
//     fields: [Stores.userId],
//     references: [Users.id],
//     relationName: 'userStores'
//   }),

//   referredUser: one(Users, {
//     fields: [Stores.referredUserId],
//     references: [Users.id],
//     relationName: 'referredStores'
//   }),

//   package: one(Packages, {
//     fields: [Stores.packageId],
//     references: [Packages.id]
//   }),

//   categories: many(Categories),
//   attributes: many(Attributes),
//   products: many(Products),
//   carousels: many(Carousels),
//   pages: many(Pages)
// }));

// export const packagesRelations = relations(Packages, ({ many }) => ({
//   stores: many(Stores)
// }));

export const attributeRelations = relations(Attributes, ({ many }) => ({
  attributeValues: many(AttributeValues)
}));

export const attributeValueRelations = relations(AttributeValues, ({ one }) => ({
  attribute: one(Attributes, {
    fields: [AttributeValues.attributeId],
    references: [Attributes.id]
  })
}));

export const productRelations = relations(Products, ({ one, many }) => ({
  categories: many(ProductCategories),
  images: many(ProductImages),
  variants: many(ProductVariants),
  pricings: many(ProductPricings)
  // orderItems: many(OrderItems)
}));

export const productImagesRelations = relations(ProductImages, ({ one }) => ({
  product: one(Products, {
    fields: [ProductImages.productId],
    references: [Products.id]
  })
}));

export const productVariantsRelations = relations(ProductVariants, ({ one }) => ({
  product: one(Products, {
    fields: [ProductVariants.productId],
    references: [Products.id]
  })
}));

export const productCategoriesRelations = relations(ProductCategories, ({ one }) => ({
  product: one(Products, {
    fields: [ProductCategories.productId],
    references: [Products.id]
  }),
  category: one(Categories, {
    fields: [ProductCategories.categoryId],
    references: [Categories.id]
  })
}));

export const productPricingsRelations = relations(ProductPricings, ({ one }) => ({
  product: one(Products, {
    fields: [ProductPricings.productId],
    references: [Products.id]
  })
}));

export const categoriesRelations = relations(Categories, ({ one }) => ({}));

export const ordersRelations = relations(Orders, ({ one, many }) => ({
  orderItems: many(OrderItems),
  user: one(Users, {
    fields: [Orders.userId],
    references: [Users.id]
  }),
  coupon: one(Coupons, {
    fields: [Orders.couponId],
    references: [Coupons.id]
  }),
  shippingAddress: one(UserAddresses, {
    fields: [Orders.shippingAddressId],
    references: [UserAddresses.id]
  }),
  orderStatusHistory: many(OrderStatusHistory)
}));

export const orderStatusHistoryRelations = relations(OrderStatusHistory, ({ one }) => ({
  order: one(Orders, {
    fields: [OrderStatusHistory.orderId],
    references: [Orders.id]
  })
}));

export const couponsRelations = relations(Coupons, ({ many }) => ({
  order: many(Orders)
}));

export const couponUsagesRelations = relations(CouponUsages, ({ one }) => ({
  coupon: one(Coupons, {
    fields: [CouponUsages.couponId],
    references: [Coupons.id]
  })
}));

export const orderItemsRelations = relations(OrderItems, ({ one }) => ({
  order: one(Orders, {
    fields: [OrderItems.orderId],
    references: [Orders.id]
  }),
  product: one(Products, {
    fields: [OrderItems.productId],
    references: [Products.id]
  })
}));

export const carouselsRelations = relations(Carousels, ({ one }) => ({}));

export const pagesRelations = relations(Pages, ({ one }) => ({}));

export const userAddressesRelations = relations(UserAddresses, ({ one }) => ({
  user: one(Users, {
    fields: [UserAddresses.userId],
    references: [Users.id]
  })
}));

// export const dealerStatementsRelations = relations(DealerStatements, ({ one }) => ({
//   user: one(Users, {
//     fields: [DealerStatements.userId],
//     references: [Users.id]
//   }),
//   dealer: one(Dealers, {
//     fields: [DealerStatements.dealerId],
//     references: [Dealers.id]
//   })
// }));

// export const DealersRelations = relations(Dealers, ({ one, many }) => ({
//   user: one(Users, {
//     fields: [Dealers.userId],
//     references: [Users.id]
//   }),
//   statements: many(DealerStatements)
// }));
