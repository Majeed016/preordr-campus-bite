
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, LogOut, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const CanteenSelection = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const { user, logout } = useAuth();
  const { canteens, selectCanteen, loading, refreshCanteens } = useCanteen();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('CanteenSelection - Current canteens:', canteens);
    console.log('CanteenSelection - Loading state:', loading);
  }, [canteens, loading]);

  const handleSubmit = () => {
    if (!selectedId) {
      toast.error('Please select a canteen');
      return;
    }

    const selected = canteens.find(c => c.id === selectedId);
    if (selected) {
      // Check if canteen is accepting orders
      const isAcceptingOrders = selected.accepting_orders !== false;
      
      if (!isAcceptingOrders) {
        toast.error('This canteen is currently not accepting orders. Please select another canteen.');
        return;
      }
      
      selectCanteen(selected);
      toast.success(`Selected ${selected.name}`);
      navigate('/menu');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleRefresh = async () => {
    console.log('Manually refreshing canteens...');
    await refreshCanteens();
    toast.success('Canteens refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading canteens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header with logout and refresh */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600">
              Please select your canteen to start ordering
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total canteens found: {canteens.length}</p>
          <p>User role: {user?.role}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>

        {canteens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No canteens available at the moment.</p>
            <p className="text-gray-500 mt-2">Please check back later or contact support.</p>
            <Button 
              onClick={handleRefresh}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {canteens.map((canteen) => {
                const isAcceptingOrders = canteen.accepting_orders !== false;
                
                return (
                  <Card 
                    key={canteen.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedId === canteen.id 
                        ? 'ring-2 ring-orange-500 shadow-lg' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    } ${!isAcceptingOrders ? 'opacity-75' : ''}`}
                    onClick={() => isAcceptingOrders && setSelectedId(canteen.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-orange-600" />
                          <span>{canteen.name}</span>
                        </div>
                        {isAcceptingOrders ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Accepting Orders
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Closed
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{canteen.location}</span>
                      </div>
                      
                      {!isAcceptingOrders && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-red-700 font-medium text-sm">
                            This canteen is currently not accepting orders.
                          </p>
                          <p className="text-red-600 text-xs mt-1">
                            Please check back later or select another canteen.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Available 8:00 AM - 6:00 PM
                        </div>
                        {selectedId === canteen.id && isAcceptingOrders && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button 
                onClick={handleSubmit}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!selectedId}
              >
                Continue to Menu
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CanteenSelection;
