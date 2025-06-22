
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const { items, totalAmount, clearCart } = useCart();
  const { selectedCanteen } = useCanteen();
  const { user } = useAuth();
  const navigate = useNavigate();

  const platformFee = 3;
  const finalTotal = totalAmount + platformFee;

  const handlePayment = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      console.log('Processing payment...', {
        user_id: user?.id,
        canteen_id: selectedCanteen?.id,
        items,
        total_amount: finalTotal,
        platform_fee: platformFee,
        canteen_amount: totalAmount,
        pickup_time: pickupTime
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success
      const paymentId = `pay_${Date.now()}`;
      
      // Clear cart
      clearCart();
      
      toast.success('Payment successful!');
      
      // Navigate to confirmation with order details
      navigate('/order-confirmation', {
        state: {
          orderId: `order_${Date.now()}`,
          paymentId,
          total: finalTotal,
          pickupTime
        }
      });

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Integration</h3>
                  <p className="text-sm text-blue-700">
                    Razorpay integration will be implemented when connected to Supabase. 
                    This is a demo payment flow.
                  </p>
                </div>

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
                  onClick={handlePayment}
                  disabled={loading || !pickupTime}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                >
                  {loading ? 'Processing...' : `Pay ₹${finalTotal}`}
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
