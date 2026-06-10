// frontend/src/components/PaymentModal.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { storeConfig } from '@/config/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Building, Loader2, Copy, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaystackButton } from 'react-paystack';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  email: string;
  onSuccess: () => void;
  orderId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  amount,
  email,
  onSuccess,
  orderId
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [flutterwaveError, setFlutterwaveError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load Flutterwave script dynamically
  useEffect(() => {
    if (!document.getElementById('flutterwave-script')) {
      const script = document.createElement('script');
      script.id = 'flutterwave-script';
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Get API keys from environment
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const flutterwavePublicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

  // Check if Paystack is configured
  useEffect(() => {
    if (!paystackPublicKey) {
      console.warn('Paystack public key not configured');
      setPaystackError('Paystack public key not configured. Please check your .env file.');
    } else {
      setPaystackError(null);
    }
  }, [paystackPublicKey]);

  // Check if Flutterwave is configured
  useEffect(() => {
    if (!flutterwavePublicKey) {
      console.warn('Flutterwave public key not configured');
      setFlutterwaveError('Flutterwave public key not configured. Please check your .env file.');
    } else {
      setFlutterwaveError(null);
    }
  }, [flutterwavePublicKey]);

  // Generate unique reference
  const generateReference = (prefix: string = 'ORD') => {
    return `${prefix}-${orderId || 'test'}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  // ============ PAYSTACK ============
  const paystackConfig = {
    reference: generateReference('PS'),
    email: email,
    amount: Math.round(amount * 100), // Paystack uses kobo
    publicKey: paystackPublicKey,
    currency: 'NGN',
    metadata: {
      custom_fields: [
        {
          display_name: "Order ID",
          variable_name: "order_id",
          value: orderId || 'N/A'
        }
      ]
    }
  };

  const handlePaystackSuccess = (reference: any) => {
    console.log('Paystack success:', reference);
    setIsProcessing(false);
    
    // Update order payment status
    fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        paymentStatus: 'paid',
        paymentReference: reference.reference,
        paymentMethod: 'paystack'
      })
    }).catch(err => console.error('Error updating order payment:', err));

    clearCart();
    toast({
      title: 'Payment Successful! 🎉',
      description: `Reference: ${reference.reference}`,
    });
    onSuccess();
    onOpenChange(false);
  };

  const handlePaystackClose = () => {
    console.log('Paystack modal closed');
    setIsProcessing(false);
    toast({
      title: 'Payment Cancelled',
      description: 'You closed the payment modal',
      variant: 'destructive',
    });
  };

  // ============ FLUTTERWAVE ============
  const handleFlutterwavePayment = () => {
    setIsProcessing(true);
    
    if (!flutterwavePublicKey) {
      setIsProcessing(false);
      toast({
        title: 'Configuration Error',
        description: 'Flutterwave public key not configured',
        variant: 'destructive',
      });
      return;
    }

    if (!window.FlutterwaveCheckout) {
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Payment gateway is still loading. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const txRef = generateReference('FLW');

    console.log('Initializing Flutterwave with:', {
      amount,
      email,
      orderId,
      txRef
    });

    try {
      window.FlutterwaveCheckout({
        public_key: flutterwavePublicKey,
        tx_ref: txRef,
        amount: amount,
        currency: 'NGN',
        payment_options: 'card,account,ussd',
        meta: {
          order_id: orderId || 'N/A'
        },
        customer: {
          email: email,
          name: email.split('@')[0],
          phone_number: '08178363424',
        },
        customizations: {
          title: storeConfig.name,
          description: `Payment for Order ${orderId || ''}`,
          logo: storeConfig.logo,
        },
        callback: (response: any) => {
          console.log('Flutterwave callback:', response);
          
          if (response.status === 'successful' || response.status === 'completed') {
            // Update order payment status
            fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                paymentStatus: 'paid',
                paymentReference: response.transaction_id || response.tx_ref,
                paymentMethod: 'flutterwave'
              })
            }).catch(err => console.error('Error updating order payment:', err));

            clearCart();
            toast({
              title: 'Payment Successful! 🎉',
              description: `Transaction ID: ${response.transaction_id}`,
            });
            onSuccess();
            onOpenChange(false);
          } else {
            toast({
              title: 'Payment Failed',
              description: response.message || 'Your payment was not successful',
              variant: 'destructive',
            });
          }
          
          window.FlutterwaveCheckout.close();
        },
        onclose: () => {
          console.log('Flutterwave modal closed');
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // ============ BANK TRANSFER ============
  const handleBankTransferConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // Update order status to indicate payment is pending via bank transfer
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentStatus: 'pending',
          paymentMethod: 'bank_transfer',
          notes: 'Awaiting bank transfer confirmation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Clear cart since order is placed
      clearCart();
      
      // Show success message
      toast({
        title: 'Order Placed!',
        description: 'Your order has been placed. Please complete the bank transfer to confirm.',
        duration: 10000,
      });
      
      // Close modal and go to order confirmation
      onSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Bank transfer confirmation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a function to copy all bank details at once
  const copyAllBankDetails = () => {
    const details = `Bank: First Bank of Nigeria
Account Name: BOLDVAN
Account Number: 2034567890
Amount: ₦${amount.toLocaleString()}
Reference: ${orderId || 'N/A'}`;
    
    navigator.clipboard.writeText(details);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied!',
      description: 'All bank details copied to clipboard.',
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied!',
      description: `${field} copied to clipboard.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">Complete Your Payment</DialogTitle>
          <DialogDescription className="text-base font-medium text-gray-700">
            Total Amount: ₦{amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="paystack" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="paystack" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 py-2.5 transition-all cursor-pointer"
              >
                Paystack
              </TabsTrigger>
              <TabsTrigger 
                value="flutterwave" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 py-2.5 transition-all cursor-pointer"
              >
                Flutterwave
              </TabsTrigger>
              <TabsTrigger 
                value="bank" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 py-2.5 transition-all cursor-pointer"
              >
                Bank Transfer
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              {/* Paystack Tab */}
              {paymentMethod === 'paystack' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    Pay securely with Paystack. We accept all major Nigerian cards and bank accounts.
                  </p>
                  
                  {paystackError ? (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{paystackError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <PaystackButton
                        {...paystackConfig}
                        text="Pay with Paystack"
                        onSuccess={handlePaystackSuccess}
                        onClose={handlePaystackClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      />
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-800 mb-3">Test Card Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Card:</span>
                            <span className="font-mono font-medium">4084 0840 8408 4081</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expiry:</span>
                            <span className="font-medium">Any future date</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CVV:</span>
                            <span className="font-medium">Any 3 digits</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">OTP:</span>
                            <span className="font-medium">1234</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Flutterwave Tab */}
              {paymentMethod === 'flutterwave' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    Pay with Flutterwave. We accept cards, bank transfers, and USSD.
                  </p>
                  
                  {flutterwaveError ? (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{flutterwaveError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        onClick={handleFlutterwavePayment}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay with Flutterwave'
                        )}
                      </Button>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-800 mb-3">Test Card Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Card:</span>
                            <span className="font-mono font-medium">5531 8866 5214 2950</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PIN:</span>
                            <span className="font-medium">3310</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expiry:</span>
                            <span className="font-medium">09/32</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CVV:</span>
                            <span className="font-medium">564</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">OTP:</span>
                            <span className="font-medium">123456</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Transfer Tab */}
              {paymentMethod === 'bank' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-purple-800 text-lg">Bank Transfer Details</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAllBankDetails}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 px-3 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {copied === 'all' ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy All
                      </Button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg space-y-3 border-2 border-purple-100">
                      <div className="flex justify-between items-center group hover:bg-purple-50 p-2 rounded-md transition-colors">
                        <span className="text-gray-600 font-medium">Bank:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">First Bank of Nigeria</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText('First Bank of Nigeria');
                              setCopied('bank');
                              setTimeout(() => setCopied(null), 2000);
                              toast({ title: 'Copied!', description: 'Bank name copied' });
                            }}
                          >
                            {copied === 'bank' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center group hover:bg-purple-50 p-2 rounded-md transition-colors">
                        <span className="text-gray-600 font-medium">Account Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">BOLDVAN</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText('BOLDVAN');
                              setCopied('accountName');
                              setTimeout(() => setCopied(null), 2000);
                              toast({ title: 'Copied!', description: 'Account name copied' });
                            }}
                          >
                            {copied === 'accountName' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center group hover:bg-purple-50 p-2 rounded-md transition-colors">
                        <span className="text-gray-600 font-medium">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700">2034567890</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText('2034567890');
                              setCopied('accountNumber');
                              setTimeout(() => setCopied(null), 2000);
                              toast({ title: 'Copied!', description: 'Account number copied' });
                            }}
                          >
                            {copied === 'accountNumber' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="font-bold text-xl text-purple-700">₦{amount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center group hover:bg-purple-50 p-2 rounded-md transition-colors">
                        <span className="text-gray-600 font-medium">Reference:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{orderId || 'N/A'}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(orderId || '');
                              setCopied('reference');
                              setTimeout(() => setCopied(null), 2000);
                              toast({ title: 'Copied!', description: 'Reference copied' });
                            }}
                          >
                            {copied === 'reference' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">📝 Instructions:</p>
                      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
                        <li>Make a transfer to the account details above</li>
                        <li>Include the <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-purple-700">{orderId || 'reference'}</span> as your payment reference</li>
                        <li>Your order will be confirmed once we receive payment</li>
                        <li>This usually takes 1-2 hours during working hours</li>
                      </ul>
                    </div>
                    
                    <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700 text-sm">
                        Do not close this page until you've copied your reference number.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button 
                    onClick={handleBankTransferConfirm}
                    disabled={isProcessing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Building className="mr-2 h-5 w-5" />
                        I Understand, Place Order
                      </>
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </Tabs>

          <p className="text-xs text-center text-gray-500 mt-6 pt-4 border-t">
            By completing this payment, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;