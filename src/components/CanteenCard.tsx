
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';

interface Canteen {
  id: string;
  name: string;
  location: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  accepting_orders?: boolean;
}

interface CanteenCardProps {
  canteen: Canteen;
  onSelect: (canteen: Canteen) => void;
}

const CanteenCard = ({ canteen, onSelect }: CanteenCardProps) => {
  const isAcceptingOrders = canteen.accepting_orders !== false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        {canteen.image_url ? (
          <img
            src={canteen.image_url}
            alt={canteen.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-orange-600">
              {canteen.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
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
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl">{canteen.name}</CardTitle>
        {canteen.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{canteen.location}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {canteen.description && (
          <p className="text-gray-600 text-sm mb-4">{canteen.description}</p>
        )}
        
        {!isAcceptingOrders && (
          <div className="text-center p-4 bg-red-50 rounded-lg mb-4">
            <p className="text-red-700 font-medium">
              This canteen is currently not accepting orders.
            </p>
            <p className="text-red-600 text-sm mt-1">
              Please check back later or try another canteen.
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => onSelect(canteen)} 
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={!isAcceptingOrders}
        >
          {isAcceptingOrders ? 'View Menu' : 'Currently Closed'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CanteenCard;
