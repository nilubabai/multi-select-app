// src/app/interfaces/select-option.interface.ts

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: any; // Add this line
}

// interface Product {
//   productTypeId: number;
//   productDescription: string;
// }

// interface Vendor {
//   dentalVendorId: string;
//   vendorName: string;
// }

// interface State {
//   stateCode: string;
//   stateName: string;
// }
