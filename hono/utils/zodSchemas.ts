import { z } from 'zod/v4';

z.config({
  customError: (iss) => {
    console.log(iss);

    if (iss.code === 'too_small' && iss.minimum == 1) {
      return 'Required';
    }

    if (iss.code === 'too_small' && iss.minimum > 1) {
      return 'Too small';
    }

    if (iss.code === 'invalid_type' && iss.expected === 'number' && iss.input === null) {
      return 'Required';
    }

    // return 'globally modified error';
  }
});

const emptyMessage = { message: "This field can't be empty" };
const selectMessage = { message: 'Must select an option' };

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10)
});

export const addUserSchema = z.object({
  email: z.email().min(5).max(250),
  password: z.string().min(6, 'Passsword must be at least 6 characters long').max(256),
  name: z.string().min(3).max(256),
  address: z.string().default(''),
  gender: z.enum(['Male', 'Female', 'Other'], selectMessage).default('Male'),
  userType: z.enum(['Admin', 'Customer', 'User'], selectMessage).default('Customer')
});

export const editUserSchema = z.object({
  name: z.string().min(3).max(256),
  gender: z.enum(['Male', 'Female', 'Other'], selectMessage).default('Male'),
  userType: z.enum(['Admin', 'Customer', 'User'], selectMessage).default('Customer'),
  address: z.string().default('')
});

export const changePasswordSchema = z.object({
  id: z.number(),
  password: z.string().min(6, 'Passsword must be at least 6 characters long').max(256)
});

export const addCategorySchema = z.object({
  parentId: z.number().optional(),
  name: z.string().min(3).max(256),
  metaTitle: z.string().max(255).nullable().optional().default(''),
  metaDescription: z.string().nullable().optional().default(''),
  isTop: z.boolean().optional().default(false),
  order: z.number().optional().default(0)
});

export const editCategorySchema = z.object({
  name: z.string().min(3).max(256),
  metaTitle: z.string().max(255).nullable().optional().default(''),
  metaDescription: z.string().nullable().optional().default(''),
  isTop: z.boolean().optional().default(false),
  order: z.number().optional().default(0)
});

export const addAttributeSchema = z.object({
  name: z.string().min(1).max(100)
});

export const editAttributeSchema = z.object({
  name: z.string().min(1).max(100)
});

export const addAttributeValueSchema = z.object({
  value: z.string().min(1).max(100)
});

export const addProductSchema = z.object({
  title: z.string().min(3).max(255)
});

export const addProductVariantSchema = z.object({
  name: z.string().min(1).max(255),
  values: z.array(z.string()).optional().default([])
});

export const editProductVariantSchema = z.object({
  name: z.string().min(1).max(255),
  values: z.array(z.string()).optional().default([])
});

export const editProductSchema = z.object({
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  vendor: z.string().max(100).nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  baseBuyPrice: z.string().optional().default('0.00'), // numeric stored as string
  basePrice: z.string().optional().default('0.00'),
  baseSalePrice: z.string().optional().default('0.00'),
  baseShippingRate: z.string().optional().default('0.00'),
  baseWeight: z.string().optional().default('0.00'),
  baseQuantity: z.number().int().optional().default(0),
  currency: z.string().max(3).optional().default('BDT'),
  taxRate: z.string().optional().default('0.00'),
  isActive: z.boolean().optional().default(true),
  status: z.enum(['Draft', 'Published']).optional().default('Draft'),
  isFeatured: z.boolean().optional().default(false),
  isOnSale: z.boolean().optional().default(false),
  categoryIds: z.array(z.number()).optional().default([])
});

export const savePricingSchema = z.record(
  z.string(),
  z.object({
    productId: z.number(),
    variation: z.string(),
    buyPrice: z.string(),
    regularPrice: z.string(),
    salePrice: z.string(),
    shippingRate: z.string(),
    weight: z.string(),
    quantity: z.number(),
    image: z.string().optional().nullable().default(''),
    new: z.boolean().optional()
  })
);

export const addStoreSchema = z.object({
  name: z.string().min(1).max(255),
  subDomain: z.string().min(3).max(100)
});

export const addEditDeliveryOptionSchema = z.object({
  name: z.string().min(1).max(100),
  charge: z.number().optional().default(0),
  weightLimit: z.number().optional().default(1)
});

export const addEditCouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['Flat', 'Percentage'], selectMessage).default('Flat'),
  discount: z.number().optional().default(0),
  minPurchase: z.number().optional().default(0),
  maxDiscount: z.number().optional().default(0),
  startDate: z.string().min(3).max(256),
  endDate: z.string().min(3).max(256),
  usageLimit: z.number().optional().default(0),
  usagePerUser: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true)
});

export const addEditAddressSchema = z.object({
  name: z.string().min(1).max(150),
  phone: z.string().min(1).max(50),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(50),
  country: z.string().min(1).max(100).default('Bangladesh')
});

//  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
//     storeId: integer('store_id')
//       .references(() => Stores.id)
//       .notNull(),
//     orderNumber: varchar('order_number', { length: 50 }).notNull(),
//     userId: integer('user_id')
//       .references(() => Users.id)
//       .notNull(),
//     shippingAddressId: integer('shipping_address_id')
//       .references(() => UserAddresses.id)
//       .notNull(),
//     billingAddressId: integer('billing_address_id')
//       .references(() => UserAddresses.id)
//       .notNull(),
//     paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // COD, Bkash, Nagad. ///
//     transactionId: varchar('transaction_id', { length: 150 }),
//     paymentMeta: jsonb('payment_meta').default('{}'),
//     customerNote: varchar('customer_note', { length: 255 }).default(''),
//     adminNote: varchar('admin_note', { length: 255 }).default(''),
//     subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
//     couponId: integer('coupon_id').references(() => Coupons.id),
//     couponDiscount: decimal('coupon_discount', { precision: 12, scale: 2 }).default('0'),
//     taxCharge: decimal('tax_charge', { precision: 12, scale: 2 }).default('0'),
//     shippingCharge: decimal('shipping_charge', { precision: 12, scale: 2 }).default('0'),
//     deliveryOption: varchar('delivery_option', { length: 50 }).notNull(), // Inside Dhaka, Outside Dhaka, Pick Up. ///
//     deliveryCharge: decimal('delivery_charge', { precision: 12, scale: 2 }).default('0'),
//     total: decimal('total', { precision: 12, scale: 2 }).notNull(),
//     paymentStatus: paymentStatusEnum('payment_status').default('Pending').notNull(),
//     orderStatus: orderStatusEnum('order_status').default('Pending').notNull(),
//     ...commonFields

export const placeOrderSchema = z.object({
  shippingAddressId: z.number(),
  billingAddressId: z.number(),
  paymentMethod: z.string(),
  customerNote: z.string().optional(),
  subtotal: z.number(),
  couponId: z.number().optional(),
  couponDiscount: z.number().optional().default(0),
  taxCharge: z.string().optional().default('0'),
  shippingCharge: z.string().optional().default('0'),
  deliveryCharge: z.string().optional().default('0'),
  deliveryOption: z.string(),
  total: z.number(),
  cartItems: z.array(
    z.object({
      productId: z.number(),
      variation: z.string(),
      image: z.string().optional().default(''),
      quantity: z.number(),
      pricePerUnit: z.number()
    })
  )
});

export const addNextStepSchema = z.object({
  status: z
    .enum(
      [
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
      ],
      selectMessage
    )
    .default('Placed'),
  note: z.string().optional()
});

export const editCarouselSchema = z.object({
  description: z.string().default(''),
  linkText: z.string().default(''),
  linkUrl: z.string().default(''),
  isActive: z.boolean().default(true)
});

export const addPageSchema = z.object({
  name: z.string().min(3).max(256),
  title: z.string().min(3).max(256),
  description: z.string().min(3),
  isPublished: z.boolean().default(true)
});

export const signupSchema = z.object({
  email: z.email().max(99),
  password: z.string().min(6).max(128),
  name: z.string().min(3).max(256),
  refCode: z.string().optional().default('')
});

export const signupTestSchema = z.object({
  email: z.email().max(99),
  password: z.string().min(6).max(128),
  name: z.string().min(3).max(256),
  refCode: z.string().optional().default('')
});

export const signinSchema = z.object({
  email: z.email().min(5).max(250),
  password: z.string().min(6).max(256)
});

export const accountTerminationSchema = z.object({
  registeredEmail: z.email().min(5).max(250),
  registeredPassword: z.string().min(6).max(256),
  subDomain: z.string().min(3).max(256)
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(150),
  gender: z.enum(['Male', 'Female', 'Other'])
});

export const addBakirKhataItemSchema = z.object({
  customerName: z.string().min(3).max(256),
  amount: z.string().min(1).max(256),
  reason: z.string().min(3).max(256),
  note: z.string().max(256).optional().default(''),
  entryDate: z.string().min(3).optional().default(new Date().toISOString())
});

export const updateReturnsSchema = z.object({
  returns: z.array(
    z.object({
      returnDate: z.string().min(3),
      returnAmount: z.string().min(1).max(256),
      note: z.string().max(256).optional().default('')
    })
  )
});

export const addIncomeExpenseSchema = z.object({
  type: z.enum(['Income', 'Expense']),
  amount: z.string().min(1).max(20),
  note: z.string().max(256).optional().default(''),
  entryDate: z.string().min(3).optional().default(new Date().toISOString())
});

export const saveAppearanceSchema = z.object({
  brandColor: z.string().min(4).max(12),
  layout: z.string().optional().nullable().default('layout1')
});

export const editStoreInfoSchema = z.object({
  name: z.string().min(3).max(256),
  metaTitle: z.string().min(3).max(256),
  metaDescription: z.string().min(3),
  metaKeywords: z.array(z.string()).optional().default([]),
  showNextToLogo: z.boolean().optional().default(true)
});

export const addDealerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).default('')
});

export const addDealerStatementSchema = z.object({
  dealerId: z.number(),
  type: z.enum(['Debit', 'Credit']),
  amount: z.string().min(1).max(20),
  note: z.string().max(256).optional().default(''),
  entryDate: z.string().min(3).optional().default(new Date().toISOString())
});

export const addDSArchiveSchema = z.object({
  dealerName: z.string().min(1).max(100),
  dealerId: z.number(),
  data: z.array(
    z.object({
      entryDate: z.string().min(3),
      type: z.enum(['Debit', 'Credit']),
      amount: z.string().min(1).max(20),
      note: z.string().max(256).optional().default('')
    })
  ),
  entryDate: z.string().min(3).optional().default(new Date().toISOString())
});
