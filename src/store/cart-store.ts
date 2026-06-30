import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  items: CartLine[];
  couponCode: string | null;
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  applyCoupon: (code: string | null) => void;
  clear: () => void;
  // selectors
  count: () => number;
  subtotal: () => number;
}

const sameLine = (a: CartLine, productId: string, variantId?: string) =>
  a.productId === productId && a.variantId === variantId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      addItem: (line) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, line.productId, line.variantId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, line.productId, line.variantId)
                  ? { ...i, quantity: i.quantity + line.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, line] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      updateQuantity: (productId, variantId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        })),

      applyCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ items: [], couponCode: null }),

      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
