
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, Package, Clock, TrendingUp } from 'lucide-react';
import { useAdminCanteen } from '@/contexts/AdminCanteenContext';

const AdminDashboard = () => {
  const { canteen, loading, toggleOrderAcceptance } = useAdminCanteen();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    platformFees: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Mock data - in real app, this would come from Supabase
    setStats({
      todayOrders: 24,
      todayRevenue: 2450,
      platformFees: 72,
      pendingOrders: 3
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            {canteen ? `Managing ${canteen.name}` : 'Manage your canteen operations'}
          </p>
        </div>

        {/* Order Acceptance Toggle */}
        {canteen && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Switch
                  id="accepting-orders"
                  checked={canteen.accepting_orders}
                  onCheckedChange={toggleOrderAcceptance}
                />
                <Label htmlFor="accepting-orders" className="text-lg">
                  {canteen.accepting_orders ? (
                    <span className="text-green-600">✅ Accepting Orders</span>
                  ) : (
                    <span className="text-red-600">❌ Not Accepting Orders</span>
                  )}
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {canteen.accepting_orders 
                  ? 'Customers can place orders from your canteen'
                  : 'Customers will see that your canteen is currently not accepting orders'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.todayOrders}</div>
              <p className="text-sm text-green-600 mt-1">↑ +12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₹{stats.todayRevenue}</div>
              <p className="text-sm text-green-600 mt-1">↑ +8% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Platform Fees</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₹{stats.platformFees}</div>
              <p className="text-sm text-gray-600 mt-1">Total collected today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
              <Clock className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</div>
              <p className="text-sm text-red-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'ORD001', user: 'John Doe', amount: 125, status: 'preparing', time: '2 min ago' },
                  { id: 'ORD002', user: 'Jane Smith', amount: 85, status: 'ready', time: '5 min ago' },
                  { id: 'ORD003', user: 'Mike Johnson', amount: 150, status: 'completed', time: '8 min ago' },
                ].map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.amount}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{order.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900">Real-time Notifications</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Get instant notifications when new orders are placed
                  </p>
                  <Badge className="mt-2 bg-orange-100 text-orange-800">Active</Badge>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Menu Management</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Update menu items, prices, and availability
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Order Processing</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Update order statuses and manage queue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
