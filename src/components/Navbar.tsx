
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { selectedCanteen } = useCanteen();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to={isAdmin ? "/admin" : "/menu"} className="text-2xl font-bold text-orange-600">
              CafePreorder
            </Link>
            
            {selectedCanteen && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{selectedCanteen.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isAdmin && (
              <>
                <Link to="/menu">
                  <Button 
                    variant={location.pathname === '/menu' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Menu
                  </Button>
                </Link>
                
                <Link to="/orders">
                  <Button 
                    variant={location.pathname === '/orders' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Orders
                  </Button>
                </Link>

                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin">
                  <Button 
                    variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                
                <Link to="/admin/orders">
                  <Button 
                    variant={location.pathname === '/admin/orders' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Orders
                  </Button>
                </Link>

                <Link to="/admin/menu">
                  <Button 
                    variant={location.pathname === '/admin/menu' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Menu
                  </Button>
                </Link>
              </>
            )}

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
