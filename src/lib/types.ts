export type Business = {
  id: string;
  user_id: string;
  name: string;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
};

export type Party = {
  id: string;
  business_id: string;
  name: string;
  type: 'customer' | 'supplier';
  gstin: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  balance: number;
};

export type Item = {
  id: string;
  business_id: string;
  name: string;
  hsn_code: string | null;
  sku: string | null;
  barcode: string | null;
  unit: string;
  sale_price: number;
  purchase_price: number;
  gst_rate: number;
  stock_quantity: number;
  low_stock_alert: number;
  batch_number: string | null;
  expiry_date: string | null;
  category: string | null;
};

export type Invoice = {
  id: string;
  business_id: string;
  party_id: string | null;
  invoice_number: string;
  type: 'sale' | 'purchase' | 'credit_note' | 'debit_note';
  date: string;
  due_date: string | null;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  discount_total: number;
  total: number;
  amount_paid: number;
  status: 'paid' | 'unpaid' | 'partial';
  notes: string | null;
  is_interstate: boolean;
  party?: Party;
};

export type InvoiceItem = {
  id?: string;
  invoice_id?: string;
  item_id: string | null;
  name: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};
