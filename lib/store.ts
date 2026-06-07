import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, CustomCartItem, Product, ProductSize } from "./types";
import { DEFAULT_SIZES, BUNDLE_QTY, BUNDLE_PRICE, BUNDLE_SIZE } from "./constants";

function currentPrice(size: ProductSize): number {
  return DEFAULT_SIZES.find((s) => s.size === size.size)?.price ?? size.price;
}

interface CartStore {
  items: CartItem[];
  customItems: CustomCartItem[];
  isOpen: boolean;
  editingCustomKey: string | null;
  addItem: (product: Product, size: ProductSize) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  incrementItem: (cartKey: string) => void;
  decrementItem: (cartKey: string) => void;
  clearCart: () => void;
  addCustomItem: (item: Omit<CustomCartItem, "cartKey">) => void;
  removeCustomItem: (cartKey: string) => void;
  updateCustomQuantity: (cartKey: string, quantity: number) => void;
  clearCustomItems: () => void;
  setEditingCustomKey: (key: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  customTotalPrice: () => number;
  bundleInfo: () => { count: number; savings: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customItems: [],
      isOpen: false,
      editingCustomKey: null,

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

      addCustomItem: (item) => {
        const cartKey = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((state) => ({ customItems: [...state.customItems, { ...item, cartKey }], isOpen: true }));
      },
      removeCustomItem: (cartKey) => {
        set((state) => ({ customItems: state.customItems.filter((i) => i.cartKey !== cartKey) }));
      },
      updateCustomQuantity: (cartKey, quantity) => {
        if (quantity <= 0) { get().removeCustomItem(cartKey); return; }
        set((state) => ({ customItems: state.customItems.map((i) => i.cartKey === cartKey ? { ...i, quantity } : i) }));
      },
      clearCustomItems: () => set({ customItems: [] }),
      setEditingCustomKey: (key) => set({ editingCustomKey: key }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0) +
        get().customItems.reduce((sum, i) => sum + i.quantity, 0),

      customTotalPrice: () =>
        get().customItems.reduce((sum, i) => {
          const price = DEFAULT_SIZES.find((s) => s.size === i.specSize)?.price ?? 0;
          return sum + price * i.quantity;
        }, 0),

      bundleInfo: () => {
        const regularLargeQty = get().items
          .filter((i) => i.size.size === BUNDLE_SIZE)
          .reduce((sum, i) => sum + i.quantity, 0);
        const customLargeQty = get().customItems
          .filter((i) => i.specSize === BUNDLE_SIZE)
          .reduce((sum, i) => sum + i.quantity, 0);
        const largeQty = regularLargeQty + customLargeQty;
        const count = Math.floor(largeQty / BUNDLE_QTY);
        const largePrice = DEFAULT_SIZES.find((s) => s.size === BUNDLE_SIZE)?.price ?? 3.9;
        const savings = count * (BUNDLE_QTY * largePrice - BUNDLE_PRICE);
        return { count, savings };
      },

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + currentPrice(i.size) * i.quantity, 0),
    }),
    {
      name: "sparkd-cart",
      version: 2,
      migrate: () => ({ items: [] as CartItem[], customItems: [] as CustomCartItem[] }),
      partialize: (state) => ({
        items: state.items,
        customItems: state.customItems.map((item) => ({
          ...item,
          sourceFiles: [] as Array<File | null>,
          // Strip per-image base64 (imgUrl) to stay within localStorage limits.
          // storageUrl (Supabase) and position data are kept for re-edit context.
          layout: {
            ...item.layout,
            images: Array.isArray(item.layout.images)
              ? (item.layout.images as Array<Record<string, unknown>>).map(
                  ({ imgUrl: _dropped, ...rest }) => rest
                )
              : item.layout.images,
          },
        })),
      }),
    }
  )
);
