import { useState, useEffect } from 'react';
import { useAdminCanteen } from '@/contexts/AdminCanteenContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  total_price: number;
  menu_items?: {
    name: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  platform_fee: number;
  canteen_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  pickup_time: string;
  created_at: string;
  payment_id: string;
  profiles?: {
    name: string;
  } | null;
  order_items?: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const { canteen } = useAdminCanteen();

  const fetchOrders = async () => {
    if (!canteen) {
      console.log('No canteen found for admin');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching orders for canteen:', canteen.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (name),
          order_items (
            *,
            menu_items (name)
          )
        `)
        .eq('canteen_id', canteen.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canteen) {
      fetchOrders();
      
      // Set up real-time subscription for orders
      const ordersChannel = supabase
        .channel('admin-orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `canteen_id=eq.${canteen.id}`
          },
          (payload) => {
            console.log('Order change detected:', payload);
            fetchOrders();
            
            if (payload.eventType === 'INSERT') {
              toast.success(`🛎️ New order received!`, {
                duration: 5000,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [canteen?.id]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
        return;
      }
      
      // Update local state immediately
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
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
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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

  if (!canteen) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Canteen Found</h2>
            <p className="text-gray-600">Please ensure you have a canteen associated with your admin account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600">Manage incoming orders for {canteen.name}</p>
          </div>
          
          <Button 
            onClick={fetchOrders}
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
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                      <span>Order #{order.id.slice(0, 8)}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{order.profiles?.name || 'Unknown User'}</span>
                      </div>
                      {order.pickup_time && (
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
                      )}
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
                      {order.order_items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.menu_items?.name || 'Unknown Item'}</span>
                            <span className="text-gray-600 ml-2">×{item.quantity}</span>
                          </div>
                          <span className="font-semibold">₹{item.total_price}</span>
                        </div>
                      )) || (
                        <div className="text-gray-500 text-sm">No items found</div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total (Canteen): ₹{order.canteen_amount} | Platform Fee: ₹{order.platform_fee}
                        </span>
                        <span className="font-bold text-green-800">₹{order.total_amount}</span>
                      </div>
                      {order.payment_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Payment ID: {order.payment_id}
                        </div>
                      )}
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

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600">
              {filter === 'all' ? 'No orders have been placed yet' : `No ${filter} orders found`}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
