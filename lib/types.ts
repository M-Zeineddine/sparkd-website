export interface ProductSize {
  size: "S" | "M" | "L";
  label: string;
  price: number;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  image_url: string;
  image_urls: string[];
  in_stock: boolean;
  is_best_seller: boolean;
  sizes: ProductSize[];
  category: string;
  tags: string[];
  created_at: string;
}

export interface CartItem {
  cartKey: string;
  product: Product;
  size: ProductSize;
  quantity: number;
}

export interface CustomCartItem {
  cartKey: string;
  specName: string;
  specSize: "S" | "M" | "L";
  dataUrl: string;
  layout: Record<string, unknown>;
  sourceFiles: Array<File | null>;
  quantity: number;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  product_id: string | null;
  quantity: number;
  price: number;
  product: {
    name: string;
    name_ar?: string;
    image_url?: string;
  };
  size?: ProductSize;
}

export interface Order {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  building_details: string;
  notes: string;
  items: OrderItem[];
  total: number;
  bundle_count: number;
  bundle_savings: number;
  status: OrderStatus;
  created_at: string;
}

export interface CustomOrder {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  city: string;
  quantity: number;
  notes: string | null;
  design_url: string;
  design_mode: string | null;
  design_layout: Record<string, unknown> | null;
  status: OrderStatus;
  created_at: string;
}

export interface SubcategoryRecord {
  id: string;
  category_id: string;
  name: string;
  name_ar: string;
  slug: string;
  sort_order: number;
}

export interface CategoryRecord {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  sort_order: number;
  subcategories: SubcategoryRecord[];
}
