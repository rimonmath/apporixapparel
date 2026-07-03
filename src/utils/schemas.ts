import { z } from 'zod/v4';

z.config({
  customError: (iss) => {
    // console.log(iss);

    if (iss.code === 'too_small' && iss.minimum == 1) {
      return 'Required';
    }

    if (iss.code === 'too_small' && iss.minimum > 1) {
      return iss.input === '' ? 'Can not be empty' : 'Too small';
    }

    if (iss.code === 'invalid_type' && iss.expected === 'number' && iss.input === null) {
      return 'Required';
    }

    // return 'globally modified error';
  }
});

const emptyMessage = { message: "This field can't be empty" };
const selectMessage = { message: 'Must select an option' };

export const signupSchema = z
  .object({
    email: z.email().min(5).max(250),
    password: z.string().min(6, 'Must be at least 6 characters long').max(256),
    confirmPassword: z.string(),
    name: z.string().min(3).max(256),
    refCode: z.string().optional().default('')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] // show error at the confirmPassword field
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

export const addUserSchema = z
  .object({
    email: z.email().min(5).max(250),
    password: z.string().min(6, 'Must be at least 6 characters long').max(256),
    confirmPassword: z.string(),
    name: z.string().min(3).max(256),
    address: z.string().default(''),
    gender: z.enum(['Male', 'Female', 'Other'], selectMessage).default('Male'),
    userType: z.enum(['Admin', 'Customer', 'User'], selectMessage).default('Customer')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] // show error at the confirmPassword field
  });

export const editUserSchema = z.object({
  name: z.string().min(3).max(256),
  gender: z.enum(['Male', 'Female', 'Other'], selectMessage).default('Male'),
  userType: z.enum(['Admin', 'Customer', 'User'], selectMessage).default('Customer'),
  address: z.string().default('')
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(6, 'Must be at least 6 characters long').max(256),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] // show error at the confirmPassword field
  });

// export const resetPasswordSchema = z
//   .object({
//     password: z.string().min(6).max(256),
//     confirmPassword: z.string()
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'] // show error at the confirmPassword field
//   });

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

export const editProductSchema = z.object({
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  vendor: z.string().max(100).nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  metaTitle: z.string().max(255).nullable().optional().default(''),
  metaDescription: z.string().nullable().optional().default(''),
  currency: z.string().max(3).optional().default('BDT'),
  taxRate: z.string().optional().default('0.00'),
  isActive: z.boolean().optional().default(true),
  status: z.enum(['Draft', 'Published', 'Archived']).optional().default('Draft'),
  isFeatured: z.boolean().optional().default(false),
  isOnSale: z.boolean().optional().default(false),
  categoryIds: z.array(z.number()).optional().default([])
});

export const addProductVariantSchema = z.object({
  name: z.string().min(1).max(255),
  values: z.array(z.string()).optional().default([])
});

export const editProductVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255).optional(),
  values: z.array(z.string()).optional().default([])
});

export const subdomainSchema = z
  .string()
  .trim()
  .min(3, { message: 'Subdomain must be at least 3 characters.' })
  .max(63, { message: 'Subdomain must be at most 63 characters.' })
  .regex(/^(?!-)[a-z0-9-]+$/, {
    message:
      'Subdomain may contain lowercase letters, numbers and hyphens and must not start with a hyphen.'
  })
  .refine((s) => !s.endsWith('-'), {
    message: 'Subdomain must not end with a hyphen.'
  });

export const addStoreSchema = z.object({
  name: z.string().min(1).max(100),
  subDomain: subdomainSchema
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

export const addEditPageSchema = z.object({
  name: z.string().min(3).max(256),
  title: z.string().min(3).max(256),
  description: z.string().min(3),
  isPublished: z.boolean().default(true)
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

export const addIncomeExpenseSchema = z.object({
  type: z.enum(['Income', 'Expense']),
  amount: z.string().min(1).max(256),
  note: z.string().max(256).optional().default(''),
  entryDate: z.string().min(3).optional().default(new Date().toISOString())
});

export const addDealerStatementSchema = z.object({
  type: z.enum(['Debit', 'Credit']),
  amount: z.string().min(1).max(256),
  note: z.string().max(256).optional().default(''),
  entryDate: z
    .string({
      message: 'Date is required'
    })
    .min(3)
    .optional()
    .default(new Date().toISOString())
});

// name: varchar('name', { length: 256 }).notNull(),
//   subDomain: varchar('sub_domain', { length: 100 }).notNull().unique(),
//   customDomain: varchar('custom_domain', { length: 256 }).unique(),
//   metaTitle: varchar('meta_title', { length: 255 }).default(''),
//   metaDescription: varchar('meta_description', { length: 255 }).default(''),
//   metaKeywords: text('meta_keywords').array().default([]),
//   logoUrl: varchar('logo_url', { length: 255 }),
//   brandColor: varchar('brand_color', { length: 20 }).default('#009edb'),
//   faviconUrl: varchar('favicon_url', { length: 255 }),
//   currency: varchar('currency', { length: 10 }).notNull().default('BDT'),
//   timezone: varchar('timezone', { length: 100 }).notNull().default('Asia/Dhaka'),
//   status: storeStatusEnum('status').notNull().default('Draft'),
//   referredUserId: integer('referred_user_id').references(() => Users.id),
//   referralRewarded: boolean('

export const editStoreInfoSchema = z.object({
  name: z.string().min(3).max(256),
  metaTitle: z.string().max(255).default(''),
  metaDescription: z.string().max(255).default(''),
  metaKeywords: z.array(z.string()).default([]),
  showNextToLogo: z.boolean().default(true)
});

export const addDealerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).default('')
});
