import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  syncCart: (validProducts: any[]) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.min(quantity, 10) }
              : item
          ),
        }));
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      syncCart: (validProducts: any[]) => {
        set((state) => ({
          items: state.items.map((item) => {
            const validProduct = validProducts.find(p => p._id === item.product.id || p.id === item.product.id);
            if (!validProduct || validProduct.isDeleted) {
              return {
                ...item,
                product: {
                  ...item.product,
                  availability: false,
                  isDeleted: true
                }
              };
            }
            return {
              ...item,
              product: {
                ...item.product,
                ...validProduct,
                id: validProduct._id || validProduct.id
              }
            };
          })
        }));
      },
    }),
    {
      name: "maison-cart",
    }
  )
);
