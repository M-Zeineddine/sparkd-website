export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  image_url: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface CartItem {
  product: Product;
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

export const CATEGORIES = [
  "Lebanese & Cultural",
  "Aesthetic & Visual",
  "Girly & Cute",
  "Manly",
  "Sporty",
  "Personality & Lifestyle",
  "LGBTQ+",
  "Weird & Wild",
  "Custom & Personalized",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_AR: Record<string, string> = {
  "Lebanese & Cultural": "لبناني وثقافي",
  "Aesthetic & Visual": "جمالي وبصري",
  "Girly & Cute": "بنتاوي ولطيف",
  Manly: "رجالي",
  Sporty: "رياضي",
  "Personality & Lifestyle": "شخصية وأسلوب حياة",
  "LGBTQ+": "مجتمع الميم+",
  "Weird & Wild": "غريب وجامح",
  "Custom & Personalized": "مخصص وشخصي",
};
