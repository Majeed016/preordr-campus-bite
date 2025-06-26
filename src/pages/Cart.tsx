import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const { items, updateQuantity, removeItem, totalAmount, clearCart, loading } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const platformFee = 3;
  const finalTotal = totalAmount + platformFee;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeItem(itemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items from the menu!</p>
          <Link to="/menu">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const isUpdating = updatingItems.has(item.id);
              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-green-600 font-medium">₹{item.price}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 ml-4"
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{finalTotal}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link to="/menu" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
