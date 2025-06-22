
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state;

  useEffect(() => {
    // If no order details, redirect to menu
    if (!orderDetails) {
      navigate('/menu');
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  const { orderId, paymentId, total, pickupTime } = orderDetails;
  const formattedPickupTime = new Date(pickupTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your payment was successful and your order is being prepared</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-semibold">{paymentId}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-700">Total Paid</p>
                <p className="text-2xl font-bold text-green-800">₹{total}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Pickup Time</p>
                <p className="font-semibold text-blue-900">{formattedPickupTime}</p>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <p className="text-sm text-orange-700">Pickup Location</p>
                  <p className="font-semibold text-orange-900">Please check your selected canteen</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Show this confirmation to collect your order
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">What happens next?</h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Order confirmed</p>
                <p className="text-sm text-gray-600">We've received your order and payment</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Preparing your order</p>
                <p className="text-sm text-gray-600">The canteen will start preparing your food</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Ready for pickup</p>
                <p className="text-sm text-gray-600">You'll be notified when your order is ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Link to="/orders" className="flex-1">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Track Order
            </Button>
          </Link>
          <Link to="/menu" className="flex-1">
            <Button variant="outline" className="w-full">
              Order Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
