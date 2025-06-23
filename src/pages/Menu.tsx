
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCanteen } from '@/contexts/CanteenContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  available_quantity: number;
}

// Mock menu data
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Sandwich',
    description: 'Grilled chicken with fresh vegetables and mayo',
    price: 85,
    category: 'Sandwiches',
    available_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Veg Burger',
    description: 'Plant-based patty with lettuce, tomato, and sauce',
    price: 75,
    category: 'Burgers',
    available_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea',
    price: 25,
    category: 'Beverages',
    available_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Pasta Alfredo',
    description: 'Creamy white sauce pasta with herbs',
    price: 120,
    category: 'Main Course',
    available_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop'
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Fresh lettuce, croutons, parmesan, and dressing',
    price: 90,
    category: 'Salads',
    available_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
  },
  {
    id: '6',
    name: 'Cold Coffee',
    description: 'Chilled coffee with ice cream and whipped cream',
    price: 65,
    category: 'Beverages',
    available_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop'
  }
];

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCart();
  const { selectedCanteen } = useCanteen();

  const categories = ['All', ...Array.from(new Set(mockMenuItems.map(item => item.category)))];

  const filteredItems = mockMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: MenuItem) => {
    if (item.available_quantity <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    // Pass complete MenuItem object with all required properties
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image_url: item.image_url,
      category: item.category,
      available_quantity: item.available_quantity,
      canteen_id: selectedCanteen?.id || 'default-canteen'
    });
    
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCanteen?.name} Menu
          </h1>
          <p className="text-gray-600">Fresh food, prepared with care</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.available_quantity > 0 
                        ? `${item.available_quantity} available`
                        : 'Out of stock'
                      }
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.available_quantity <= 0}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
