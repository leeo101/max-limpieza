import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // Wishlist
  wishlist: string[]; // Store product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Admin / UI
  isMiniCartOpen: boolean;
  setMiniCartOpen: (open: boolean) => void;
  pendingOrdersCount: number;
  setPendingOrdersCount: (count: number) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart Initial State
      cart: [],
      isMiniCartOpen: false,
      wishlist: [],
      pendingOrdersCount: 0,

      // Cart Actions
      addToCart: (product, quantity = 1) => {
        const cart = get().cart;
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedCart = cart.map((item) =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ cart: updatedCart });
        } else {
          set({ 
            cart: [...cart, { 
              id: product.id, 
              name: product.name, 
              price: product.price, 
              quantity, 
              image: product.image 
            }] 
          });
        }
        // Trigger sidebar automatically when adding
        set({ isMiniCartOpen: true });
        
        // Dispatch legacy event for non-zustand components during transition
        window.dispatchEvent(new Event('cartUpdated'));
      },

      removeFromCart: (productId) => {
        const updatedCart = get().cart.filter((item) => item.id !== productId);
        set({ cart: updatedCart });
        window.dispatchEvent(new Event('cartUpdated'));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const updatedCart = get().cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        set({ cart: updatedCart });
        window.dispatchEvent(new Event('cartUpdated'));
      },

      clearCart: () => {
        set({ cart: [] });
        window.dispatchEvent(new Event('cartUpdated'));
      },

      cartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Wishlist Actions
      toggleWishlist: (productId) => {
        const wishlist = get().wishlist;
        if (wishlist.includes(productId)) {
          set({ wishlist: wishlist.filter(id => id !== productId) });
        } else {
          set({ wishlist: [...wishlist, productId] });
        }
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      // UI Actions
      setMiniCartOpen: (open) => set({ isMiniCartOpen: open }),
      setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),
    }),
    {
      name: 'max-limpieza-storage', // key in localStorage
      partialize: (state) => ({ 
        cart: state.cart, 
        wishlist: state.wishlist 
      }), // only persist these fields
    }
  )
);
