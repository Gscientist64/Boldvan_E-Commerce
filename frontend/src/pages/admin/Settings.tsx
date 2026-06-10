import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Globe,
  DollarSign,
  Percent,
  Truck,
  ShoppingBag,
  CreditCard,
  Mail,
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const settingsSchema = z.object({
  // General
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
  address: z.string().optional(),

  // Currency
  currency: z.string().default('NGN'),
  currencySymbol: z.string().default('₦'),
  currencyPosition: z.enum(['before', 'after']),

  // Tax
  taxEnabled: z.boolean().default(true),
  taxRate: z.number().min(0).max(100),
  taxIncluded: z.boolean().default(false),

  // Shipping
  freeShippingThreshold: z.number().min(0),
  defaultShippingFee: z.number().min(0),

  // Orders
  autoConfirmOrders: z.boolean().default(false),
  orderPrefix: z.string().default('ORD'),
  invoicePrefix: z.string().default('INV'),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),

  // Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token') || '';

  // Fetch settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['marketplace-settings'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      return response.json();
    },
  });

  // Fetch payment settings separately (sensitive data)
  const {
    data: paymentSettings,
    refetch: refetchPaymentSettings
  } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings/payment`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    },
  });

  // Fetch email settings separately (sensitive data)
  const {
    data: emailSettings,
    refetch: refetchEmailSettings
  } = useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings/email`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: 'BOLDVAN',
      siteDescription: 'Your trusted solar energy marketplace',
      currency: 'NGN',
      currencySymbol: '₦',
      currencyPosition: 'before',
      taxEnabled: true,
      taxRate: 7.5,
      taxIncluded: false,
      freeShippingThreshold: 50000,
      defaultShippingFee: 2500,
      autoConfirmOrders: false,
      orderPrefix: 'ORD',
      invoicePrefix: 'INV',
      maintenanceMode: false,
      maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon.',
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Marketplace settings have been saved successfully.',
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

  // Update payment settings mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: 'Payment settings updated',
        description: 'Payment configuration has been saved successfully.',
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

  // Update email settings mutation
  const updateEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update email settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: 'Email settings updated',
        description: 'Email configuration has been saved successfully.',
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

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/settings/email/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Test email sent',
        description: 'Check your inbox for the test email.',
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

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/cache/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Cache cleared',
        description: 'All system caches have been cleared.',
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

  const [paymentForm, setPaymentForm] = useState({
    paystackPublicKey: '',
    paystackSecretKey: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
    bankTransferEnabled: true,
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
  });

  const [emailForm, setEmailForm] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: '',
    smtpFromName: '',
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMutation.mutate(paymentForm);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailMutation.mutate(emailForm);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  // Update payment form when payment settings are loaded
  React.useEffect(() => {
    if (paymentSettings) {
      setPaymentForm(paymentSettings);
    }
  }, [paymentSettings]);

  // Update email form when email settings are loaded
  React.useEffect(() => {
    if (emailSettings) {
      setEmailForm(emailSettings);
    }
  }, [emailSettings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure your marketplace, payments, shipping, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => clearCacheMutation.mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="mr-2 h-4 w-4" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="tax">
            <Percent className="mr-2 h-4 w-4" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="mr-2 h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic marketplace information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your marketplace name displayed throughout the site
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Brief description for search engines
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Public email for customer inquiries
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Public phone number for customer support
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Dedicated support email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supportPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Dedicated support phone line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormDescription>
                          Your physical business address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Configure your marketplace currency and formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="grid grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          ISO currency code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currencySymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Symbol</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Symbol displayed with prices
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currencyPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="before">Before (₦1,000)</SelectItem>
                            <SelectItem value="after">After (1,000₦)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Where to place the currency symbol
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure VAT and tax rules for Nigeria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taxEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Tax
                          </FormLabel>
                          <FormDescription>
                            Apply tax to all product prices
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('taxEnabled') && (
                    <>
                      <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              VAT rate in Nigeria (default: 7.5%)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxIncluded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Tax Included in Prices
                              </FormLabel>
                              <FormDescription>
                                Prices already include tax
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>
                Configure shipping rules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="freeShippingThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Shipping Threshold (₦)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Orders above this amount get free shipping
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultShippingFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Shipping Fee (₦)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Base shipping fee for standard delivery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertTitle>Advanced Delivery Configuration</AlertTitle>
                  <AlertDescription>
                    For detailed delivery location and method management, go to the{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('delivery')}>
                      Delivery Management
                    </Button>{' '}
                    section.
                  </AlertDescription>
                </Alert>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Settings */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>
                Configure order processing and numbering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="orderPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Prefix</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix for order numbers (e.g., ORD-12345)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoicePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Prefix</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix for invoice numbers (e.g., INV-12345)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="autoConfirmOrders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto-confirm Orders
                        </FormLabel>
                        <FormDescription>
                          Automatically confirm orders after payment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment gateways and banking details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Paystack</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets.paystackPublicKey ? 'text' : 'password'}
                          value={paymentForm.paystackPublicKey}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paystackPublicKey: e.target.value }))}
                          placeholder="pk_test_..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('paystackPublicKey')}
                        >
                          {showSecrets.paystackPublicKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets.paystackSecretKey ? 'text' : 'password'}
                          value={paymentForm.paystackSecretKey}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paystackSecretKey: e.target.value }))}
                          placeholder="sk_test_..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('paystackSecretKey')}
                        >
                          {showSecrets.paystackSecretKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Flutterwave</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets.flutterwavePublicKey ? 'text' : 'password'}
                          value={paymentForm.flutterwavePublicKey}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, flutterwavePublicKey: e.target.value }))}
                          placeholder="FLWPUBK-..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('flutterwavePublicKey')}
                        >
                          {showSecrets.flutterwavePublicKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets.flutterwaveSecretKey ? 'text' : 'password'}
                          value={paymentForm.flutterwaveSecretKey}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, flutterwaveSecretKey: e.target.value }))}
                          placeholder="FLWSECK-..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('flutterwaveSecretKey')}
                        >
                          {showSecrets.flutterwaveSecretKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Bank Transfer</h3>
                    <Switch
                      checked={paymentForm.bankTransferEnabled}
                      onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, bankTransferEnabled: checked }))}
                    />
                  </div>

                  {paymentForm.bankTransferEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          value={paymentForm.bankAccountName}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankAccountName: e.target.value }))}
                          placeholder="BOLDVAN"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          value={paymentForm.bankAccountNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={paymentForm.bankName}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="First Bank of Nigeria"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updatePaymentMutation.isPending}>
                    {updatePaymentMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Payment Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Settings Tab (Hidden but accessible) */}
      {activeTab === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure SMTP settings for transactional emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailForm.smtpHost}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={emailForm.smtpPort}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, smtpPort: e.target.value }))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={emailForm.smtpUser}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.smtpPassword ? 'text' : 'password'}
                      value={emailForm.smtpPassword}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecret('smtpPassword')}
                    >
                      {showSecrets.smtpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    value={emailForm.smtpFromEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, smtpFromEmail: e.target.value }))}
                    placeholder="BOLDVANresourcesng@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={emailForm.smtpFromName}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, smtpFromName: e.target.value }))}
                    placeholder="BOLDVAN"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                >
                  {testEmailMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Test Email
                </Button>
                <Button type="submit" disabled={updateEmailMutation.isPending}>
                  {updateEmailMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Email Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;