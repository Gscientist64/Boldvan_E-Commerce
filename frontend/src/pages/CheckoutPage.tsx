// frontend/src/pages/CheckoutPage.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Truck,
  Shield,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building,
  Package,
  ChevronRight,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import PaymentModal from '@/components/PaymentModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    price: 2500,
    estimatedDays: '3-5',
    description: 'Delivered to your doorstep within 3-5 business days'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    price: 5000,
    estimatedDays: '1-2',
    description: 'Priority handling and express shipping'
  },
  {
    id: 'pickup',
    name: 'Pickup Station',
    price: 0,
    estimatedDays: '1-2',
    description: 'Pick up from your nearest pickup station'
  }
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const redirectPerformed = useRef(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [shippingMethod, setShippingMethod] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Handle empty cart redirect - only once
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !redirectPerformed.current) {
      redirectPerformed.current = true;
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checkout',
        variant: 'destructive',
      });
      navigate('/cart');
    }
  }, [cartLoading, items.length, navigate, toast]);

  // Validate form only when needed
  const validateField = useCallback((name: keyof FormData, value: string): string | undefined => {
    if (!value.trim()) {
      if (name === 'firstName') return 'First name is required';
      if (name === 'lastName') return 'Last name is required';
      if (name === 'email') return 'Email is required';
      if (name === 'phone') return 'Phone number is required';
      if (name === 'address') return 'Address is required';
      if (name === 'city') return 'City is required';
      if (name === 'state') return 'State is required';
    }
    
    if (name === 'email' && value.trim() && !/\S+@\S+\.\S+/.test(value)) {
      return 'Email is invalid';
    }
    
    return undefined;
  }, []);

  // Update validation when form data changes
  useEffect(() => {
    const errors: FormErrors = {};
    
    if (touched.firstName) {
      const error = validateField('firstName', formData.firstName);
      if (error) errors.firstName = error;
    }
    if (touched.lastName) {
      const error = validateField('lastName', formData.lastName);
      if (error) errors.lastName = error;
    }
    if (touched.email) {
      const error = validateField('email', formData.email);
      if (error) errors.email = error;
    }
    if (touched.phone) {
      const error = validateField('phone', formData.phone);
      if (error) errors.phone = error;
    }
    if (touched.address) {
      const error = validateField('address', formData.address);
      if (error) errors.address = error;
    }
    if (touched.city) {
      const error = validateField('city', formData.city);
      if (error) errors.city = error;
    }
    if (touched.state) {
      const error = validateField('state', formData.state);
      if (error) errors.state = error;
    }
    
    setFormErrors(errors);
  }, [formData, touched, validateField]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  }, [touched]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  }, [touched]);

  const validateAllFields = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    
    setFormErrors(errors);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return Object.keys(errors).length === 0;
  }, [formData]);

  const selectedShipping = useMemo(() => 
    SHIPPING_METHODS.find(m => m.id === shippingMethod),
    [shippingMethod]
  );

  const shippingCost = useMemo(() => 
    selectedShipping?.price || 0,
    [selectedShipping]
  );

  const totalAmount = useMemo(() => 
    total + shippingCost,
    [total, shippingCost]
  );

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (validateAllFields()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && shippingMethod) {
      setCurrentStep(3);
    }
  }, [currentStep, validateAllFields, shippingMethod]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!agreeTerms) {
      toast({
        title: 'Terms required',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please login to continue',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        shipping: {
          ...formData,
          method: selectedShipping?.name,
          shippingFee: shippingCost
        },
        paymentMethod,
        subtotal: total,
        total: totalAmount,
        notes: formData.deliveryInstructions
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }

      const order = await response.json();
      setOrderId(order.id);
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [agreeTerms, items, formData, selectedShipping, shippingCost, paymentMethod, total, totalAmount, navigate, toast]);

  const handlePaymentSuccess = useCallback(() => {
    clearCart();
    toast({
      title: 'Order confirmed!',
      description: 'Your order has been placed successfully.',
    });
    navigate(`/order-confirmation?orderId=${orderId}`, {
      state: { orderId }
    });
  }, [clearCart, navigate, toast, orderId]);

  // Show loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Add some items to your cart before checkout</p>
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-slate-300">Complete your purchase</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-slate-300 bg-white text-slate-500'
              }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-teal-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.firstName ? 'border-red-500' : ''}
                      />
                      {formErrors.firstName && (
                        <p className="text-sm text-red-500">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.lastName ? 'border-red-500' : ''}
                      />
                      {formErrors.lastName && (
                        <p className="text-sm text-red-500">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.address ? 'border-red-500' : ''}
                      />
                      {formErrors.address && (
                        <p className="text-sm text-red-500">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.city ? 'border-red-500' : ''}
                      />
                      {formErrors.city && (
                        <p className="text-sm text-red-500">{formErrors.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={formErrors.state ? 'border-red-500' : ''}
                      />
                      {formErrors.state && (
                        <p className="text-sm text-red-500">{formErrors.state}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="deliveryInstructions"
                        name="deliveryInstructions"
                        value={formData.deliveryInstructions}
                        onChange={handleInputChange}
                        placeholder="e.g., Gate code, landmark, etc."
                        rows={3}
                      />
                    </div>

                    <div className="col-span-2 flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                      />
                      <Label htmlFor="saveAddress">Save this address for future orders</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping Method */}
            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-teal-600" />
                    Shipping Method
                  </h2>

                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="space-y-4">
                      {SHIPPING_METHODS.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            shippingMethod === method.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-slate-200 hover:border-teal-200'
                          }`}
                          onClick={() => setShippingMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex-1">
                            <Label htmlFor={method.id} className="flex justify-between cursor-pointer">
                              <div>
                                <span className="font-medium text-lg">{method.name}</span>
                                <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Estimated delivery: {method.estimatedDays} business days
                                </p>
                              </div>
                              <span className="font-bold text-teal-600">
                                {method.price === 0 ? 'FREE' : `₦${method.price.toLocaleString()}`}
                              </span>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                    Payment Method
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'paystack'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-teal-200'
                        }`}
                        onClick={() => setPaymentMethod('paystack')}
                      >
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label htmlFor="paystack" className="flex items-center gap-3 cursor-pointer flex-1">
                          <img src="/images/paystack-logo.svg" alt="Paystack" className="h-8" />
                          <span>Pay with Paystack (Cards, Bank Transfer, USSD)</span>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'flutterwave'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-teal-200'
                        }`}
                        onClick={() => setPaymentMethod('flutterwave')}
                      >
                        <RadioGroupItem value="flutterwave" id="flutterwave" />
                        <Label htmlFor="flutterwave" className="flex items-center gap-3 cursor-pointer flex-1">
                          <img src="/images/flutterwave-logo.svg" alt="Flutterwave" className="h-8" />
                          <span>Pay with Flutterwave (Cards, Bank Transfer, USSD)</span>
                        </Label>
                      </div>

                      <div
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'bank'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-teal-200'
                        }`}
                        onClick={() => setPaymentMethod('bank')}
                      >
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Building className="h-6 w-6 text-slate-600" />
                          <span>Bank Transfer (Pay directly to our bank account)</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 flex items-center space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      I agree to the{' '}
                      <button className="text-teal-600 hover:underline">Terms of Service</button>
                      {' '}and{' '}
                      <button className="text-teal-600 hover:underline">Privacy Policy</button>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">₦{total.toLocaleString()}</span>
                  </div>
                  
                  {shippingMethod && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? 'FREE' : `₦${shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-teal-600">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !agreeTerms}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Place Order
                    </Button>
                  )}

                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="w-full border-2 border-slate-200 hover:border-teal-500"
                    >
                      Back
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={totalAmount}
        email={formData.email}
        orderId={orderId}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CheckoutPage;