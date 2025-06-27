import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category: string;
  available_quantity: number;
  canteen_id: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  id: string; // This will be the cart item ID from database
  menu_item_id: string; // Reference to the menu item
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
  totalItems: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          menu_item_id,
          menu_items (
            id,
            name,
            price,
            description,
            image_url,
            category,
            available_quantity,
            canteen_id
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      // Transform the data to match our CartItem interface
      const cartItems: CartItem[] = data?.map(item => ({
        id: item.id, // This is the cart item ID
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        ...item.menu_items
      })) || [];

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  // Poll for cart updates every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchCartItems();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const addItem = async (item: MenuItem, quantity: number = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      // Check if item already exists in cart by menu_item_id
      const existingItem = items.find(i => i.menu_item_id === item.id);
      
      if (existingItem) {
        // Update quantity of existing cart item
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            menu_item_id: item.id,
            quantity: quantity
          });

        if (error) {
          // If duplicate key error, fetch the cart item and update quantity
          if (error.code === '23505') {
            // Fetch the cart item id
            const { data, error: fetchError } = await supabase
              .from('cart_items')
              .select('id, quantity')
              .eq('user_id', user.id)
              .eq('menu_item_id', item.id)
              .single();
            if (!fetchError && data) {
              await updateQuantity(data.id, data.quantity + quantity);
              toast.success(`${quantity}x ${item.name} added to cart`);
              return;
            }
          }
          console.error('Error adding item to cart:', error);
          toast.error('Failed to add item to cart');
          return;
        }

        toast.success(`${quantity}x ${item.name} added to cart`);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing item from cart:', error);
        toast.error('Failed to remove item from cart');
        return;
      }

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating cart item quantity:', error);
        toast.error('Failed to update quantity');
        return;
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
        return;
      }

      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
