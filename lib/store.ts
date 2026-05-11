import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductSize } from "./types";
import { DEFAULT_SIZES } from "./constants";

function currentPrice(size: ProductSize): number {
  return DEFAULT_SIZES.find((s) => s.size === size.size)?.price ?? size.price;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: ProductSize) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
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

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + currentPrice(i.size) * i.quantity, 0),
    }),
    {
      name: "sparkd-cart",
      version: 2,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
