export const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'http://localhost:3000';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:3000';
export const genders = [
  {
    label: 'Male',
    value: 'Male'
  },
  {
    label: 'Female',
    value: 'Female'
  },
  {
    label: 'Other',
    value: 'Other'
  }
];

export const userTypes = [
  {
    label: 'Admin',
    value: 'Admin'
  },
  {
    label: 'User',
    value: 'User'
  },
  {
    label: 'Customer',
    value: 'Customer'
  }
];

export const availablePaymentMethods = [
  { label: 'Cash On Delivery', value: 'Cash On Delivery' },
  { label: 'Bkash', value: 'Bkash' },
  { label: 'Nagad', value: 'Nagad', disabled: true },
  { label: 'Rocket', value: 'Rocket', disabled: true },
  { label: 'Upay', value: 'Upay', disabled: true },
  { label: 'Visa Card', value: 'Visa Card', disabled: true },
  { label: 'Master Card', value: 'Master Card', disabled: true },
  { label: 'Others', value: 'Others' }
];
