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

export interface SubcategoryInfo {
  label: string;
  slug: string;
}

export const CATEGORY_TREE: Record<string, SubcategoryInfo[]> = {
  "Anime & Manga": [
    { label: "Attack on Titan", slug: "attack-on-titan" },
    { label: "Naruto", slug: "naruto" },
    { label: "Hunter x Hunter", slug: "hunter-x-hunter" },
  ],
  "Characters": [
    { label: "Pokemon", slug: "pokemon" },
    { label: "Sanrio", slug: "sanrio" },
    { label: "Cartoons", slug: "cartoons" },
  ],
  "Lebanese & Arabic": [
    { label: "Lebanese Culture", slug: "lebanese-culture" },
    { label: "Arabic Typography", slug: "arabic-typography" },
  ],
  "Hip-Hop": [],
  "Dark & Streetwear": [],
  "Aesthetic": [],
  "Cats": [],
};

export const CATEGORIES = Object.keys(CATEGORY_TREE);

export const CATEGORY_AR: Record<string, string> = {
  "Anime & Manga": "أنمي ومانغا",
  "Characters": "شخصيات",
  "Lebanese & Arabic": "لبناني وعربي",
  "Hip-Hop": "هيب هوب",
  "Dark & Streetwear": "داكن وستريتوير",
  "Aesthetic": "أيستيتيك",
  "Cats": "قطط",
};

export const SUBCATEGORY_AR: Record<string, string> = {
  "attack-on-titan": "هجوم العمالقة",
  "naruto": "ناروتو",
  "hunter-x-hunter": "هانتر × هانتر",
  "pokemon": "بوكيمون",
  "sanrio": "سانريو",
  "cartoons": "كرتون",
  "lebanese-culture": "الثقافة اللبنانية",
  "arabic-typography": "الخط العربي",
};

export const ALL_SUBCATEGORY_SLUGS = new Set(
  Object.values(CATEGORY_TREE).flatMap((subs) => subs.map((s) => s.slug))
);
