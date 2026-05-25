import { ProductSize } from "@/lib/types";

export interface LighterSpec {
  name: string;
  size: "S" | "M" | "L";
  wrapWidth: number;  // cm — total flat wrap width (circumference)
  wrapHeight: number; // cm — wrap height
  faceWidth: number;  // cm — each visible side face width
}

export const LIGHTERS: Record<string, LighterSpec> = {
  bic_large: {
    name: "BIC Large",
    size: "L",
    wrapWidth: 6.5,
    wrapHeight: 6.8,
    faceWidth: 2.6,
  },
};

export const DEFAULT_LIGHTER = LIGHTERS.bic_large;

export const LEBANESE_CITIES: string[] = [
  "Aanjar", "Ain Ebel", "Aley", "Akkar", "Baabda", "Baalbek", "Batroun",
  "Beirut", "Byblos", "Chouf", "Hasbaya", "Hermel", "Jbeil", "Jounieh",
  "Kesrwan", "Koura", "Marjayoun", "Metn", "Nabatieh", "Rashaya",
  "Sidon", "Tripoli", "Tyre", "Zahle",
];

export const DELIVERY_FEE = 4;

export const BUNDLE_QTY = 3;
export const BUNDLE_PRICE = 10;
export const BUNDLE_SIZE = "L";

export const DEFAULT_SIZES: ProductSize[] = [
  { size: "S", label: "Small",  price: 3,   available: false },
  { size: "M", label: "Medium", price: 3.5, available: false },
  { size: "L", label: "Large",  price: 4,   available: true },
];

// Merge DB sizes (availability only) with DEFAULT_SIZES (prices).
// Prices always come from constants — change them once, they apply everywhere.
export function mergeSizes(dbSizes?: ProductSize[]): ProductSize[] {
  return DEFAULT_SIZES.map((def) => {
    const db = dbSizes?.find((s) => s.size === def.size);
    return {
      ...def,
      price: db?.price ?? def.price,
      available: db?.available ?? def.available,
    };
  });
}
