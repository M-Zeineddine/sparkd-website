import { ProductSize } from "@/lib/types";

export const LEBANESE_CITIES: string[] = [
  "Aanjar", "Ain Ebel", "Aley", "Akkar", "Baabda", "Baalbek", "Batroun",
  "Beirut", "Byblos", "Chouf", "Hasbaya", "Hermel", "Jbeil", "Jounieh",
  "Kesrwan", "Koura", "Marjayoun", "Metn", "Nabatieh", "Rashaya",
  "Sidon", "Tripoli", "Tyre", "Zahle",
];

export const DEFAULT_SIZES: ProductSize[] = [
  { size: "S", label: "Small",  price: 3,   available: false },
  { size: "M", label: "Medium", price: 3.5, available: false },
  { size: "L", label: "Large",  price: 4,   available: true },
];

/**
 * Merge DB sizes (availability only) with DEFAULT_SIZES (prices).
 * Prices always come from constants — change them once, they apply everywhere.
 */
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
