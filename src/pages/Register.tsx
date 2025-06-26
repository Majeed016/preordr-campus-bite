
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Upload, User, Building2, CheckCircle } from 'lucide-react';

const Register = () => {
  const [activeTab, setActiveTab] = useState('user');
  
  // User registration state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Admin registration state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    canteenName: '',
    canteenLocation: '',
    canteenPhoto: null as File | null
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user && !registrationSuccess) {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/canteen-selection');
    }
    return null;
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (userForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(userForm.email, userForm.password, userForm.name, 'user');
      
      setRegistrationSuccess(true);
      toast.success('Account created successfully! You can now sign in.');
      
      // Clear form
      setUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminForm.name || !adminForm.email || !adminForm.password || !adminForm.confirmPassword || !adminForm.canteenName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (adminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(adminForm.email, adminForm.password, adminForm.name, 'admin', {
        canteenName: adminForm.canteenName,
        canteenLocation: adminForm.canteenLocation,
        canteenPhoto: adminForm.canteenPhoto
      });
      
      setRegistrationSuccess(true);
      toast.success('Admin account and canteen created successfully! You can now sign in.');
      
      // Clear form
      setAdminForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        canteenName: '',
        canteenLocation: '',
        canteenPhoto: null
      });
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdminForm(prev => ({ ...prev, canteenPhoto: file }));
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Registration Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. Redirecting to login...
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-orange-600">Cafe</span>Preorder
          </CardTitle>
          <p className="text-gray-600">Create your account</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">User</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs sm:text-sm">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Canteen Owner</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="user-confirm-password">Confirm Password</Label>
                  <Input
                    id="user-confirm-password"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create User Account'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="admin-name">Admin Full Name</Label>
                  <Input
                    id="admin-name"
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={adminForm.password}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="canteen-name">Canteen Name *</Label>
                  <Input
                    id="canteen-name"
                    type="text"
                    value={adminForm.canteenName}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, canteenName: e.target.value }))}
                    placeholder="Enter canteen name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="canteen-location">Canteen Location (Optional)</Label>
                  <Input
                    id="canteen-location"
                    type="text"
                    value={adminForm.canteenLocation}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, canteenLocation: e.target.value }))}
                    placeholder="Enter canteen location"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="canteen-photo">Canteen Photo (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="canteen-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('canteen-photo')?.click()}
                      className="w-full"
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {adminForm.canteenPhoto ? adminForm.canteenPhoto.name : 'Upload Photo'}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                >
                  {loading ? 'Creating Account & Canteen...' : 'Create Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
