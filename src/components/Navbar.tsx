
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, MapPin, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { selectedCanteen } = useCanteen();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Canteen Info */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <Link to={isAdmin ? "/admin" : "/menu"} className="text-xl sm:text-2xl font-bold text-orange-600 flex-shrink-0">
              CafePreorder
            </Link>
            
            {selectedCanteen && (
              <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{selectedCanteen.name}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Cart and Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {!isAdmin && (
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
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>

              {!isAdmin && (
                <>
                  <Link to="/menu" onClick={closeMobileMenu}>
                    <Button 
                      variant={location.pathname === '/menu' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Menu
                    </Button>
                  </Link>
                  
                  <Link to="/orders" onClick={closeMobileMenu}>
                    <Button 
                      variant={location.pathname === '/orders' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Orders
                    </Button>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin" onClick={closeMobileMenu}>
                    <Button 
                      variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/admin/orders" onClick={closeMobileMenu}>
                    <Button 
                      variant={location.pathname === '/admin/orders' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Orders
                    </Button>
                  </Link>

                  <Link to="/admin/menu" onClick={closeMobileMenu}>
                    <Button 
                      variant={location.pathname === '/admin/menu' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Menu
                    </Button>
                  </Link>
                </>
              )}

              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
