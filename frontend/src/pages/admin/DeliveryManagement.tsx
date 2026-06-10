import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Truck, 
  Link as LinkIcon,
  Loader2,
  Save,
  X,
  AlertCircle,
  Settings,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const DeliveryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('locations');
  
  // Location state
  const [locationDialog, setLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    description: '',
    baseFee: '',
    estimatedDays: '',
    isActive: true,
    sortOrder: 0
  });

  // Method state
  const [methodDialog, setMethodDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [methodForm, setMethodForm] = useState({
    name: '',
    description: '',
    baseFee: '',
    estimatedDays: '',
    isActive: true,
    sortOrder: 0
  });

  // Mapping state
  const [mappingDialog, setMappingDialog] = useState(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);
  const [mappingForm, setMappingForm] = useState({
    locationId: '',
    methodId: '',
    customFee: '',
    customDays: '',
    isActive: true
  });

  // Settings state
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    freeShippingThreshold: '',
    returnPolicy: '',
    warrantyInfo: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: ''
  });

  // Seller state
  const [sellerDialog, setSellerDialog] = useState(false);
  const [sellerForm, setSellerForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    rating: '',
    totalSales: '',
    successRate: '',
    memberSince: '',
    responseTime: '',
    badges: [] as string[]
  });
  const [badgeInput, setBadgeInput] = useState('');

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: string } | null>(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token') || '';

  // Fetch locations
  const { 
    data: locations, 
    isLoading: locationsLoading,
    refetch: refetchLocations 
  } = useQuery({
    queryKey: ['delivery-locations'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  // Fetch methods
  const { 
    data: methods, 
    isLoading: methodsLoading,
    refetch: refetchMethods 
  } = useQuery({
    queryKey: ['delivery-methods'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/methods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch methods');
      return response.json();
    },
  });

  // Fetch mappings
  const { 
    data: mappings, 
    isLoading: mappingsLoading,
    refetch: refetchMappings 
  } = useQuery({
    queryKey: ['delivery-mappings'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/mappings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch mappings');
      return response.json();
    },
  });

  // Fetch shop settings
  const { 
    data: settings, 
    refetch: refetchSettings 
  } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Fetch seller info
  const { 
    data: seller, 
    refetch: refetchSeller 
  } = useQuery({
    queryKey: ['seller-info'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/seller`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch seller info');
      return response.json();
    },
  });

  // Create/Update Location Mutation
  const locationMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const url = editingLocation
        ? `${API_BASE_URL}/admin/delivery/locations/${editingLocation.id}`
        : `${API_BASE_URL}/admin/delivery/locations`;
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save location');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-locations'] });
      setLocationDialog(false);
      resetLocationForm();
      toast({
        title: editingLocation ? 'Location updated' : 'Location created',
        description: `Delivery location has been ${editingLocation ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create/Update Method Mutation
  const methodMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const url = editingMethod
        ? `${API_BASE_URL}/admin/delivery/methods/${editingMethod.id}`
        : `${API_BASE_URL}/admin/delivery/methods`;
      const method = editingMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-methods'] });
      setMethodDialog(false);
      resetMethodForm();
      toast({
        title: editingMethod ? 'Method updated' : 'Method created',
        description: `Delivery method has been ${editingMethod ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create/Update Mapping Mutation
  const mappingMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/mappings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save mapping');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-mappings'] });
      setMappingDialog(false);
      resetMappingForm();
      toast({
        title: 'Mapping saved',
        description: 'Location-method mapping has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update Settings Mutation
  const settingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
      setSettingsDialog(false);
      toast({
        title: 'Settings updated',
        description: 'Shop settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update Seller Mutation
  const sellerMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/delivery/seller`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update seller info');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-info'] });
      setSellerDialog(false);
      toast({
        title: 'Seller info updated',
        description: 'Seller information has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const token = getAuthToken();
      const endpoint = type === 'location' 
        ? `locations/${id}`
        : type === 'method'
        ? `methods/${id}`
        : `mappings/${id}`;

      const response = await fetch(`${API_BASE_URL}/admin/delivery/${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`delivery-${variables.type}s`] 
      });
      if (variables.type === 'mapping') {
        queryClient.invalidateQueries({ queryKey: ['delivery-mappings'] });
      }
      setDeleteDialog(false);
      setDeleteItem(null);
      toast({
        title: 'Deleted',
        description: `${variables.type} has been deleted successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetLocationForm = () => {
    setLocationForm({
      name: '',
      description: '',
      baseFee: '',
      estimatedDays: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingLocation(null);
  };

  const resetMethodForm = () => {
    setMethodForm({
      name: '',
      description: '',
      baseFee: '',
      estimatedDays: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingMethod(null);
  };

  const resetMappingForm = () => {
    setMappingForm({
      locationId: '',
      methodId: '',
      customFee: '',
      customDays: '',
      isActive: true
    });
    setEditingMapping(null);
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    setLocationForm({
      name: location.name,
      description: location.description || '',
      baseFee: location.baseFee.toString(),
      estimatedDays: location.estimatedDays,
      isActive: location.isActive,
      sortOrder: location.sortOrder || 0
    });
    setLocationDialog(true);
  };

  const handleEditMethod = (method: any) => {
    setEditingMethod(method);
    setMethodForm({
      name: method.name,
      description: method.description || '',
      baseFee: method.baseFee.toString(),
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
      sortOrder: method.sortOrder || 0
    });
    setMethodDialog(true);
  };

  const handleEditMapping = (mapping: any) => {
    setEditingMapping(mapping);
    setMappingForm({
      locationId: mapping.locationId,
      methodId: mapping.methodId,
      customFee: mapping.customFee?.toString() || '',
      customDays: mapping.customDays || '',
      isActive: mapping.isActive
    });
    setMappingDialog(true);
  };

  const handleEditSettings = () => {
    if (settings) {
      setSettingsForm({
        freeShippingThreshold: settings.freeShippingThreshold?.toString() || '50000',
        returnPolicy: settings.returnPolicy || '',
        warrantyInfo: settings.warrantyInfo || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        whatsappNumber: settings.whatsappNumber || ''
      });
    }
    setSettingsDialog(true);
  };

  const handleEditSeller = () => {
    if (seller) {
      setSellerForm({
        name: seller.name || '',
        description: seller.description || '',
        email: seller.email || '',
        phone: seller.phone || '',
        whatsapp: seller.whatsapp || '',
        address: seller.address || '',
        rating: seller.rating?.toString() || '4.9',
        totalSales: seller.totalSales?.toString() || '1500',
        successRate: seller.successRate?.toString() || '100',
        memberSince: seller.memberSince || '2019',
        responseTime: seller.responseTime || '< 1 hour',
        badges: seller.badges || []
      });
    }
    setSellerDialog(true);
  };

  const handleDelete = (id: string, type: string) => {
    setDeleteItem({ id, type });
    setDeleteDialog(true);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    locationMutation.mutate({
      ...locationForm,
      baseFee: parseFloat(locationForm.baseFee)
    });
  };

  const handleMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    methodMutation.mutate({
      ...methodForm,
      baseFee: parseFloat(methodForm.baseFee)
    });
  };

  const handleMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mappingMutation.mutate({
      ...mappingForm,
      customFee: mappingForm.customFee ? parseFloat(mappingForm.customFee) : null,
      customDays: mappingForm.customDays || null
    });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    settingsMutation.mutate({
      ...settingsForm,
      freeShippingThreshold: parseFloat(settingsForm.freeShippingThreshold)
    });
  };

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sellerMutation.mutate({
      ...sellerForm,
      rating: parseFloat(sellerForm.rating),
      totalSales: parseInt(sellerForm.totalSales),
      successRate: parseInt(sellerForm.successRate)
    });
  };

  const addBadge = () => {
    if (badgeInput.trim()) {
      setSellerForm(prev => ({
        ...prev,
        badges: [...prev.badges, badgeInput.trim()]
      }));
      setBadgeInput('');
    }
  };

  const removeBadge = (index: number) => {
    setSellerForm(prev => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Delivery Management</CardTitle>
              <CardDescription>
                Configure delivery locations, methods, pricing, shop settings and seller information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="locations">
                <MapPin className="mr-2 h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="methods">
                <Truck className="mr-2 h-4 w-4" />
                Methods
              </TabsTrigger>
              <TabsTrigger value="mappings">
                <LinkIcon className="mr-2 h-4 w-4" />
                Mapping
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Shop Settings
              </TabsTrigger>
            </TabsList>

            {/* Locations Tab */}
            <TabsContent value="locations" className="mt-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Delivery Locations</h3>
                <Dialog open={locationDialog} onOpenChange={setLocationDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingLocation ? 'Edit Location' : 'Add New Location'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingLocation 
                          ? 'Update delivery location details'
                          : 'Create a new delivery location'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLocationSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="locationName">Location Name *</Label>
                          <Input
                            id="locationName"
                            value={locationForm.name}
                            onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Lagos Mainland"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="locationDescription">Description</Label>
                          <Textarea
                            id="locationDescription"
                            value={locationForm.description}
                            onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the location"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="baseFee">Base Fee (₦) *</Label>
                            <Input
                              id="baseFee"
                              type="number"
                              min="0"
                              step="100"
                              value={locationForm.baseFee}
                              onChange={(e) => setLocationForm(prev => ({ ...prev, baseFee: e.target.value }))}
                              placeholder="2500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estimatedDays">Est. Days *</Label>
                            <Input
                              id="estimatedDays"
                              value={locationForm.estimatedDays}
                              onChange={(e) => setLocationForm(prev => ({ ...prev, estimatedDays: e.target.value }))}
                              placeholder="1-3"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sortOrder">Sort Order</Label>
                            <Input
                              id="sortOrder"
                              type="number"
                              min="0"
                              value={locationForm.sortOrder}
                              onChange={(e) => setLocationForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Switch
                              id="isActive"
                              checked={locationForm.isActive}
                              onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Active</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLocationDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={locationMutation.isPending}>
                          {locationMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {editingLocation ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {locationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Base Fee</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations?.map((location: any) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.description || '-'}</TableCell>
                        <TableCell>₦{location.baseFee.toLocaleString()}</TableCell>
                        <TableCell>{location.estimatedDays} days</TableCell>
                        <TableCell>{location.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={location.isActive ? 'success' : 'secondary'}>
                            {location.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(location.id, 'location')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Methods Tab */}
            <TabsContent value="methods" className="mt-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Delivery Methods</h3>
                <Dialog open={methodDialog} onOpenChange={setMethodDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMethod ? 'Edit Method' : 'Add New Method'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMethod 
                          ? 'Update delivery method details'
                          : 'Create a new delivery method'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMethodSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="methodName">Method Name *</Label>
                          <Input
                            id="methodName"
                            value={methodForm.name}
                            onChange={(e) => setMethodForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Standard Delivery"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="methodDescription">Description</Label>
                          <Textarea
                            id="methodDescription"
                            value={methodForm.description}
                            onChange={(e) => setMethodForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description of the delivery method"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="methodBaseFee">Base Fee (₦) *</Label>
                            <Input
                              id="methodBaseFee"
                              type="number"
                              min="0"
                              step="100"
                              value={methodForm.baseFee}
                              onChange={(e) => setMethodForm(prev => ({ ...prev, baseFee: e.target.value }))}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="methodEstimatedDays">Est. Days *</Label>
                            <Input
                              id="methodEstimatedDays"
                              value={methodForm.estimatedDays}
                              onChange={(e) => setMethodForm(prev => ({ ...prev, estimatedDays: e.target.value }))}
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="methodSortOrder">Sort Order</Label>
                            <Input
                              id="methodSortOrder"
                              type="number"
                              min="0"
                              value={methodForm.sortOrder}
                              onChange={(e) => setMethodForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Switch
                              id="methodIsActive"
                              checked={methodForm.isActive}
                              onCheckedChange={(checked) => setMethodForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="methodIsActive">Active</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setMethodDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={methodMutation.isPending}>
                          {methodMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {editingMethod ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {methodsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Base Fee</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods?.map((method: any) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>{method.description || '-'}</TableCell>
                        <TableCell>₦{method.baseFee.toLocaleString()}</TableCell>
                        <TableCell>+{method.estimatedDays} days</TableCell>
                        <TableCell>{method.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={method.isActive ? 'success' : 'secondary'}>
                            {method.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMethod(method)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(method.id, 'method')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Mappings Tab */}
            <TabsContent value="mappings" className="mt-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Location-Method Mapping</h3>
                <Dialog open={mappingDialog} onOpenChange={setMappingDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Mapping
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMapping ? 'Edit Mapping' : 'Add New Mapping'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure delivery options for specific location-method combinations
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMappingSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="locationId">Location *</Label>
                          <Select
                            value={mappingForm.locationId}
                            onValueChange={(value) => setMappingForm(prev => ({ ...prev, locationId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations?.filter((l: any) => l.isActive).map((location: any) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} (₦{location.baseFee.toLocaleString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="methodId">Delivery Method *</Label>
                          <Select
                            value={mappingForm.methodId}
                            onValueChange={(value) => setMappingForm(prev => ({ ...prev, methodId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {methods?.filter((m: any) => m.isActive).map((method: any) => (
                                <SelectItem key={method.id} value={method.id}>
                                  {method.name} (+₦{method.baseFee.toLocaleString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Separator />
                        <p className="text-sm text-gray-500">
                          Leave custom fields empty to use default pricing and days
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="customFee">Custom Fee (₦)</Label>
                            <Input
                              id="customFee"
                              type="number"
                              min="0"
                              step="100"
                              value={mappingForm.customFee}
                              onChange={(e) => setMappingForm(prev => ({ ...prev, customFee: e.target.value }))}
                              placeholder="Override total fee"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customDays">Custom Days</Label>
                            <Input
                              id="customDays"
                              value={mappingForm.customDays}
                              onChange={(e) => setMappingForm(prev => ({ ...prev, customDays: e.target.value }))}
                              placeholder="e.g., 2-3"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="mappingIsActive"
                            checked={mappingForm.isActive}
                            onCheckedChange={(checked) => setMappingForm(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label htmlFor="mappingIsActive">Active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setMappingDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={mappingMutation.isPending}>
                          {mappingMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save Mapping
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {mappingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Default Fee</TableHead>
                      <TableHead>Custom Fee</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings?.map((mapping: any) => {
                      const defaultFee = (mapping.location?.baseFee || 0) + (mapping.method?.baseFee || 0);
                      return (
                        <TableRow key={mapping.id}>
                          <TableCell className="font-medium">{mapping.location?.name}</TableCell>
                          <TableCell>{mapping.method?.name}</TableCell>
                          <TableCell className="text-gray-500">
                            ₦{defaultFee.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {mapping.customFee ? (
                              <span className="font-medium text-blue-600">
                                ₦{mapping.customFee.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {mapping.customDays || `${mapping.location?.estimatedDays} + ${mapping.method?.estimatedDays}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={mapping.isActive ? 'success' : 'secondary'}>
                              {mapping.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMapping(mapping)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(mapping.id, 'mapping')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Shop Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shop Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Shop Settings
                    </CardTitle>
                    <CardDescription>
                      Configure global shop settings and policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Free Shipping Threshold</p>
                          <p className="text-sm text-gray-500">
                            Orders above ₦{settings?.freeShippingThreshold?.toLocaleString() || '50,000'} get free shipping
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleEditSettings}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <Separator />
                      <div>
                        <p className="font-medium">Return Policy</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {settings?.returnPolicy || '30-day return policy for defective items'}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="font-medium">Warranty Information</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {settings?.warrantyInfo || '1-year warranty on all products'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seller Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Seller Information
                    </CardTitle>
                    <CardDescription>
                      Manage seller profile and badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{seller?.name || 'BOLDVAN'}</p>
                          <p className="text-sm text-gray-500">
                            ⭐ {seller?.rating || 4.9} • {seller?.totalSales?.toLocaleString() || '1,500'}+ sales
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleEditSeller}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        {seller?.badges?.map((badge: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            ✓ {badge}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          📍 {seller?.address || 'Lagos, Nigeria'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ⚡ Success Rate: {seller?.successRate || 100}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Settings Dialog */}
          <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Shop Settings</DialogTitle>
                <DialogDescription>
                  Update your shop's global settings and policies
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSettingsSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₦)</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      min="0"
                      step="1000"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, freeShippingThreshold: e.target.value }))}
                      placeholder="50000"
                    />
                    <p className="text-xs text-gray-500">
                      Orders above this amount qualify for free shipping
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Textarea
                      id="returnPolicy"
                      value={settingsForm.returnPolicy}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, returnPolicy: e.target.value }))}
                      placeholder="30-day return policy for defective items..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyInfo">Warranty Information</Label>
                    <Textarea
                      id="warrantyInfo"
                      value={settingsForm.warrantyInfo}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, warrantyInfo: e.target.value }))}
                      placeholder="1-year warranty on all products..."
                      rows={3}
                    />
                  </div>
                  <Separator />
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="BOLDVANresourcesng@gmail.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={settingsForm.contactPhone}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="08178363424"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        placeholder="08178363424"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSettingsDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={settingsMutation.isPending}>
                    {settingsMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Seller Dialog */}
          <Dialog open={sellerDialog} onOpenChange={setSellerDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Seller Information</DialogTitle>
                <DialogDescription>
                  Update your seller profile, badges, and performance metrics
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSellerSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Seller Name *</Label>
                    <Input
                      id="sellerName"
                      value={sellerForm.name}
                      onChange={(e) => setSellerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="BOLDVAN"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerDescription">Description</Label>
                    <Textarea
                      id="sellerDescription"
                      value={sellerForm.description}
                      onChange={(e) => setSellerForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="About your business..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellerEmail">Email</Label>
                      <Input
                        id="sellerEmail"
                        type="email"
                        value={sellerForm.email}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="sales@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellerPhone">Phone</Label>
                      <Input
                        id="sellerPhone"
                        value={sellerForm.phone}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="08178363424"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellerWhatsapp">WhatsApp</Label>
                      <Input
                        id="sellerWhatsapp"
                        value={sellerForm.whatsapp}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="08178363424"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellerAddress">Address</Label>
                      <Input
                        id="sellerAddress"
                        value={sellerForm.address}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                  </div>
                  <Separator />
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellerRating">Rating</Label>
                      <Input
                        id="sellerRating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={sellerForm.rating}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, rating: e.target.value }))}
                        placeholder="4.9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalSales">Total Sales</Label>
                      <Input
                        id="totalSales"
                        type="number"
                        min="0"
                        value={sellerForm.totalSales}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, totalSales: e.target.value }))}
                        placeholder="1500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="successRate">Success Rate %</Label>
                      <Input
                        id="successRate"
                        type="number"
                        min="0"
                        max="100"
                        value={sellerForm.successRate}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, successRate: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberSince">Member Since</Label>
                      <Input
                        id="memberSince"
                        value={sellerForm.memberSince}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, memberSince: e.target.value }))}
                        placeholder="2019"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responseTime">Response Time</Label>
                      <Input
                        id="responseTime"
                        value={sellerForm.responseTime}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, responseTime: e.target.value }))}
                        placeholder="< 1 hour"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Badges</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {sellerForm.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                          {badge}
                          <button
                            type="button"
                            onClick={() => removeBadge(index)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={badgeInput}
                        onChange={(e) => setBadgeInput(e.target.value)}
                        placeholder="Add a badge (e.g., Verified Seller)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addBadge();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addBadge}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSellerDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sellerMutation.isPending}>
                    {sellerMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the{' '}
                  {deleteItem?.type}.
                  {deleteItem?.type === 'location' && 
                    ' Locations with existing orders will be deactivated instead.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteItem && deleteMutation.mutate(deleteItem)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryManagement;