import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductSize } from "./types";
import { DEFAULT_SIZES, BUNDLE_QTY, BUNDLE_PRICE, BUNDLE_SIZE } from "./constants";

function currentPrice(size: ProductSize): number {
  return DEFAULT_SIZES.find((s) => s.size === size.size)?.price ?? size.price;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: ProductSize) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  incrementItem: (cartKey: string) => void;
  decrementItem: (cartKey: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  bundleInfo: () => { count: number; savings: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size) => {
        const cartKey = `${product.id}-${size.size}`;
        set((state) => {
          const existing = state.items.find((i) => i.cartKey === cartKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { cartKey, product, size, quantity: 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartKey !== cartKey),
        }));
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity } : i
          ),
        }));
      },

      incrementItem: (cartKey) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }));
      },

      decrementItem: (cartKey) => {
        set((state) => {
          const item = state.items.find((i) => i.cartKey === cartKey);
          if (!item) return state;
          if (item.quantity <= 1) {
            return { items: state.items.filter((i) => i.cartKey !== cartKey) };
          }
          return {
            items: state.items.map((i) =>
              i.cartKey === cartKey ? { ...i, quantity: i.quantity - 1 } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      bundleInfo: () => {
        const largeQty = get().items
          .filter((i) => i.size.size === BUNDLE_SIZE)
          .reduce((sum, i) => sum + i.quantity, 0);
        const count = Math.floor(largeQty / BUNDLE_QTY);
        const largePrice = DEFAULT_SIZES.find((s) => s.size === BUNDLE_SIZE)?.price ?? 4;
        const savings = count * (BUNDLE_QTY * largePrice - BUNDLE_PRICE);
        return { count, savings };
      },

      totalPrice: () => {
        const subtotal = get().items.reduce((sum, i) => sum + currentPrice(i.size) * i.quantity, 0);
        const { savings } = get().bundleInfo();
        return subtotal - savings;
      },
    }),
    {
      name: "sparkd-cart",
      version: 2,
      migrate: () => ({ items: [] }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
