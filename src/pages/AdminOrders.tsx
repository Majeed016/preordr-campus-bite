
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_name: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  platform_fee: number;
  canteen_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  pickup_time: string;
  created_at: string;
  payment_id: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'order_1703123456',
    user_name: 'John Doe',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 85 },
      { name: 'Cold Coffee', quantity: 1, price: 65 }
    ],
    total_amount: 153,
    platform_fee: 3,
    canteen_amount: 150,
    status: 'pending',
    pickup_time: '2024-12-21T14:30:00Z',
    created_at: '2024-12-21T13:45:00Z',
    payment_id: 'pay_1703123456'
  },
  {
    id: 'order_1703123457',
    user_name: 'Jane Smith',
    items: [
      { name: 'Veg Burger', quantity: 2, price: 75 }
    ],
    total_amount: 153,
    platform_fee: 3,
    canteen_amount: 150,
    status: 'preparing',
    pickup_time: '2024-12-21T15:00:00Z',
    created_at: '2024-12-21T14:15:00Z',
    payment_id: 'pay_1703123457'
  },
  {
    id: 'order_1703123458',
    user_name: 'Mike Johnson',
    items: [
      { name: 'Pasta Alfredo', quantity: 1, price: 120 },
      { name: 'Masala Chai', quantity: 2, price: 25 }
    ],
    total_amount: 173,
    platform_fee: 3,
    canteen_amount: 170,
    status: 'ready',
    pickup_time: '2024-12-21T13:45:00Z',
    created_at: '2024-12-21T13:00:00Z',
    payment_id: 'pay_1703123458'
  }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Simulate real-time order notifications
  useEffect(() => {
    // Listen for new orders (in real app, this would use Supabase Realtime)
    const interval = setInterval(() => {
      // Simulate a new order occasionally
      if (Math.random() < 0.1) {
        const newOrder: Order = {
          id: `order_${Date.now()}`,
          user_name: ['Alice Brown', 'Bob Wilson', 'Carol Davis'][Math.floor(Math.random() * 3)],
          items: [{ name: 'Sample Item', quantity: 1, price: 75 }],
          total_amount: 78,
          platform_fee: 3,
          canteen_amount: 75,
          status: 'pending',
          pickup_time: new Date(Date.now() + 30 * 60000).toISOString(),
          created_at: new Date().toISOString(),
          payment_id: `pay_${Date.now()}`
        };

        setOrders(prev => [newOrder, ...prev]);
        
        // Show notification
        toast.success(`🛎️ New order from ${newOrder.user_name} - ₹${newOrder.total_amount}`, {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => console.log('View order:', newOrder.id)
          }
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600">Manage incoming orders and update their status</p>
          </div>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      <span>Order #{order.id}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{order.user_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Pickup: {new Date(order.pickup_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium mb-3">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-600 ml-2">×{item.quantity}</span>
                          </div>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total (Canteen): ₹{order.canteen_amount} | Platform Fee: ₹{order.platform_fee}
                        </span>
                        <span className="font-bold text-green-800">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center space-y-3">
                    {getNextStatus(order.status) && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Mark as {getNextStatus(order.status)?.charAt(0).toUpperCase() + getNextStatus(order.status)?.slice(1)}
                      </Button>
                    )}
                    
                    {order.status === 'ready' && (
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-sm font-medium text-green-800">
                          Ready for pickup!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Customer will be notified
                        </p>
                      </div>
                    )}
                    
                    {order.status === 'completed' && (
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Order completed</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600">
              {filter === 'all' ? 'No orders have been placed yet' : `No ${filter} orders found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
