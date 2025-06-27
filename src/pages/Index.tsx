import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, Clock, CreditCard, Bell } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              <span className="text-orange-600">Campus</span>Eats
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Skip the queue, order ahead. Perfect for students and employees who want 
              to grab their favorite meals without waiting.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link to="/register">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose CampusEats?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Designed for busy campus life and workplace convenience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 sm:pt-8 px-4">
                <div className="bg-orange-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Multiple Canteens</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Order from any canteen on campus or in your workplace
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 sm:pt-8 px-4">
                <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Skip the Queue</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Order ahead and pick up when it's ready
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 sm:pt-8 px-4">
                <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy Payments</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Secure payments with transparent pricing
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 sm:pt-8 px-4">
                <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Get notified when your order is ready
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 lg:py-24 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Skip the Queue?
          </h2>
          <p className="text-lg sm:text-xl text-orange-100 mb-6 sm:mb-8 px-4">
            Join thousands of students and employees who already use CampusEats
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
              Start Ordering Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
