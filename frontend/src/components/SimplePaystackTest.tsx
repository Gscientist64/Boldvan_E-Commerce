// frontend/src/components/SimplePaystackTest.tsx

import React from 'react';
import { PaystackButton } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';

interface SimplePaystackTestProps {
  amount: number;
  email: string;
  onSuccess: () => void;
}

const SimplePaystackTest: React.FC<SimplePaystackTestProps> = ({ 
  amount, 
  email, 
  onSuccess 
}) => {
  const { toast } = useToast();

  // Paystack configuration
  const config = {
    reference: new Date().getTime().toString(), // Unique reference
    email: email,
    amount: amount * 100, // Paystack works in kobo (multiply by 100)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    metadata: {
      custom_fields: [
        {
          display_name: "Test Payment",
          variable_name: "test_payment",
          value: "Simple Test"
        }
      ]
    }
  };

  // Handle success callback
  const handleSuccess = (response: any) => {
    console.log('Payment successful!', response);
    toast({
      title: 'Payment Successful! 🎉',
      description: `Reference: ${response.reference}`,
    });
    onSuccess();
  };

  // Handle close callback
  const handleClose = () => {
    console.log('Payment modal closed');
    toast({
      title: 'Payment Cancelled',
      description: 'You closed the payment modal',
      variant: 'destructive',
    });
  };

  // Component props for PaystackButton
  const componentProps = {
    ...config,
    text: 'Pay with Paystack',
    onSuccess: handleSuccess,
    onClose: handleClose,
    className: 'w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors'
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Simple Paystack Test</h2>
      <p className="mb-4">Amount: ₦{amount.toLocaleString()}</p>
      <p className="mb-4">Email: {email}</p>
      <PaystackButton {...componentProps} />
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Test Card: 4084 0840 8408 4081</p>
        <p>Expiry: Any future date</p>
        <p>CVV: Any 3 digits</p>
        <p>OTP: Any 4 digits</p>
      </div>
    </div>
  );
};

export default SimplePaystackTest;