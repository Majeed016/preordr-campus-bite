import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const { items, totalAmount, clearCart } = useCart();
  const { selectedCanteen } = useCanteen();
  const { user } = useAuth();
  const navigate = useNavigate();

  const platformFee = 3;
  const finalTotal = totalAmount + platformFee;

  const createOrder = async () => {
    if (!selectedCanteen || !user) {
      toast.error('Please select a canteen and login');
      return null;
    }

    try {
      console.log('Creating order in database...', {
        user_id: user.id,
        canteen_id: selectedCanteen.id,
        total_amount: finalTotal,
        platform_fee: platformFee,
        canteen_amount: totalAmount,
        pickup_time: pickupTime
      });

      // Create the order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          canteen_id: selectedCanteen.id,
          total_amount: finalTotal,
          platform_fee: platformFee,
          canteen_amount: totalAmount,
          pickup_time: pickupTime,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', orderData);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to create order items');
      }

      console.log('Order items created successfully');
      return orderData;

    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }

    if (!selectedCanteen || !user) {
      toast.error('Please select a canteen and login');
      return;
    }

    setLoading(true);
    
    try {
      // First create the order in our database
      const orderData = await createOrder();
      if (!orderData) {
        throw new Error('Failed to create order');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_51O8X8X8X8X8X8', // Replace with your actual key
        amount: finalTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'Campus Bite',
        description: `Order from ${selectedCanteen.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Update order with payment ID
            const { error: updateError } = await supabase
              .from('orders')
              .update({ 
                payment_id: response.razorpay_payment_id,
                status: 'preparing'
              })
              .eq('id', orderData.id);

            if (updateError) {
              console.error('Error updating order:', updateError);
              throw new Error('Failed to update order');
            }

            // Clear cart after successful payment
            try {
              await clearCart();
            } catch (cartError) {
              console.error('Error clearing cart:', cartError);
              // Don't fail the order if cart clearing fails
            }

            toast.success('Payment successful! Your order has been placed.');
            navigate('/order-confirmation', { 
              state: { orderId: orderData.id } 
            });
          } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Payment successful but order update failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#f97316',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate pickup time options (next 2 hours in 15-minute intervals)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    for (let i = 0; i < 8; i++) {
      const time = new Date(startTime.getTime() + i * 15 * 60000);
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      times.push({
        value: time.toISOString(),
        label: timeString
      });
    }
    return times;
  };

  const pickupTimes = generatePickupTimes();

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Canteen Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{selectedCanteen?.name}</h3>
                <p className="text-gray-600">{selectedCanteen?.location}</p>
              </CardContent>
            </Card>

            {/* Pickup Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Pickup Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="pickupTime">Select preferred pickup time</Label>
                <select 
                  id="pickupTime"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Choose pickup time</option>
                  {pickupTimes.map(time => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">₹{finalTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">₹{finalTotal}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Food: ₹{totalAmount} + Platform Fee: ₹{platformFee}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleRazorpayPayment}
                  disabled={loading || !pickupTime}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                >
                  {loading ? 'Processing...' : `Pay ₹${finalTotal} with Razorpay`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
