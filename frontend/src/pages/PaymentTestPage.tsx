// frontend/src/pages/PaymentTestPage.tsx

import React, { useState } from 'react';
import SimplePaystackTest from '@/components/SimplePaystackTest';
import { Button } from '@/components/ui/button';

const PaymentTestPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleSuccess = () => {
    setPaymentComplete(true);
    setShowPayment(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Payment Test Page</h1>
      
      {!showPayment && !paymentComplete && (
        <Button onClick={() => setShowPayment(true)}>
          Start Payment Test
        </Button>
      )}

      {showPayment && (
        <SimplePaystackTest
          amount={5000} // ₦5,000
          email="test@example.com"
          onSuccess={handleSuccess}
        />
      )}

      {paymentComplete && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Complete!</h2>
          <p className="text-green-600">Your test payment was successful.</p>
          <Button 
            onClick={() => {
              setPaymentComplete(false);
              setShowPayment(false);
            }}
            className="mt-4"
          >
            Test Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentTestPage;