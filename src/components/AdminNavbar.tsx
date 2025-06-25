
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCanteen } from '@/contexts/AdminCanteenContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Bell, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const { canteen, toggleOrderAcceptance } = useAdminCanteen();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              {canteen?.name || 'Admin Dashboard'}
            </h1>
          </div>

          {/* Center - Order Toggle */}
          {canteen && (
            <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                {canteen.accepting_orders ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <Label htmlFor="accepting-orders" className="text-sm font-medium">
                  {canteen.accepting_orders ? 'Accepting Orders' : 'Orders Paused'}
                </Label>
              </div>
              <Switch
                id="accepting-orders"
                checked={canteen.accepting_orders}
                onCheckedChange={toggleOrderAcceptance}
              />
              <Badge 
                className={canteen.accepting_orders 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              >
                {canteen.accepting_orders ? 'OPEN' : 'CLOSED'}
              </Badge>
            </div>
          )}

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {user?.name}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
