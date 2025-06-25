
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Clock, TrendingUp, Users, Menu, ShoppingCart } from 'lucide-react';
import { useAdminCanteen } from '@/contexts/AdminCanteenContext';

const AdminDashboard = () => {
  const { canteen, stats, loading } = useAdminCanteen();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
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
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">
            {canteen ? `Managing ${canteen.name}` : 'Manage your canteen operations'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.todayOrders}</div>
              <p className="text-sm text-blue-600 mt-1">Total orders received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₹{stats.todayRevenue}</div>
              <p className="text-sm text-green-600 mt-1">Gross revenue</p>
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

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Real-time Updates</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    All stats and orders are updated in real-time
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Live</Badge>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Order Status</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {canteen?.accepting_orders 
                      ? 'Currently accepting new orders' 
                      : 'Orders are currently paused'
                    }
                  </p>
                  <Badge className={canteen?.accepting_orders 
                    ? 'mt-2 bg-green-100 text-green-800' 
                    : 'mt-2 bg-red-100 text-red-800'
                  }>
                    {canteen?.accepting_orders ? 'Open' : 'Closed'}
                  </Badge>
                </div>

                <Button 
                  onClick={() => navigate('/admin/orders')}
                  className="w-full"
                  variant="outline"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Manage Orders
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Net Revenue Today</span>
                  <span className="font-bold text-green-600">
                    ₹{stats.todayRevenue - stats.platformFees}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Average Order Value</span>
                  <span className="font-bold">
                    ₹{stats.todayOrders > 0 ? Math.round(stats.todayRevenue / stats.todayOrders) : 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={canteen?.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }>
                    {canteen?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <Button 
                  onClick={() => navigate('/admin/menu')}
                  className="w-full"
                  variant="outline"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Manage Menu Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
