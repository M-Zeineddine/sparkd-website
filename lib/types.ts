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

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

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
  items: CartItem[];
  total: number;
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
