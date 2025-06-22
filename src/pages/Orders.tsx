
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Receipt, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  platform_fee: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  pickup_time: string;
  created_at: string;
  payment_id: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'order_1703123456',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 85 },
      { name: 'Cold Coffee', quantity: 1, price: 65 }
    ],
    total_amount: 153,
    platform_fee: 3,
    status: 'preparing',
    pickup_time: '2024-12-21T14:30:00Z',
    created_at: '2024-12-21T13:45:00Z',
    payment_id: 'pay_1703123456'
  },
  {
    id: 'order_1703023456',
    items: [
      { name: 'Veg Burger', quantity: 2, price: 75 },
      { name: 'Masala Chai', quantity: 1, price: 25 }
    ],
    total_amount: 178,
    platform_fee: 3,
    status: 'completed',
    pickup_time: '2024-12-20T12:15:00Z',
    created_at: '2024-12-20T11:30:00Z',
    payment_id: 'pay_1703023456'
  }
];

const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'preparing': return 'Being Prepared';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const refreshOrders = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <Button 
            onClick={refreshOrders}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Pickup: {new Date(order.pickup_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Food: ₹{order.total_amount - order.platform_fee} + Platform Fee: ₹{order.platform_fee}
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        Total: ₹{order.total_amount}
                      </div>
                    </div>
                  </div>

                  {/* Status-specific actions */}
                  {order.status === 'ready' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Ready for pickup!</p>
                          <p className="text-sm text-green-700">
                            Please collect your order from the canteen
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                        <p className="text-blue-800 font-medium">Your order is being prepared</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
