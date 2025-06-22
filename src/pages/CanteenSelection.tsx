
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanteen } from '@/contexts/CanteenContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

const CanteenSelection = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const { user } = useAuth();
  const { canteens, selectCanteen } = useCanteen();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!selectedId) {
      toast.error('Please select a canteen');
      return;
    }

    const selected = canteens.find(c => c.id === selectedId);
    if (selected) {
      selectCanteen(selected);
      toast.success(`Selected ${selected.name}`);
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Please select your canteen to start ordering
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {canteens.map((canteen) => (
            <Card 
              key={canteen.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedId === canteen.id 
                  ? 'ring-2 ring-orange-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => setSelectedId(canteen.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>{canteen.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{canteen.location}</span>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Available 8:00 AM - 6:00 PM
                  </div>
                  {selectedId === canteen.id && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
      </div>
    </div>
  );
};

export default CanteenSelection;
