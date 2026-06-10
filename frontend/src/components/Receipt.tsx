// frontend/src/components/Receipt.tsx

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, Printer, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ReceiptProps {
  order: any;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ order, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      toast({
        title: 'Generating receipt...',
        description: 'Please wait while we generate your receipt.',
      });

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      // Convert to image and download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `receipt-${order.orderNumber}.png`;
      link.click();

      toast({
        title: 'Receipt downloaded!',
        description: 'Your receipt has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !receiptRef.current) return;

    const receiptHtml = receiptRef.current.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; margin-top: 20px; text-align: right; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${receiptHtml}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!));
      });

      const file = new File([blob], `receipt-${order.orderNumber}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Receipt - ${order.orderNumber}`,
          text: `Payment receipt for order ${order.orderNumber}`,
          files: [file]
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied',
          description: 'Receipt link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to share receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Receipt</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Receipt Content */}
          <div ref={receiptRef} className="bg-white p-6 rounded-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-2xl">BOLDVAN<span className="text-teal-600">Resources</span></span>
              </div>
              <p className="text-sm text-gray-500">Payment Receipt</p>
            </div>

            {/* Order Info */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Customer Info */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p className="text-sm text-gray-600">
                {order.shipping.firstName} {order.shipping.lastName}<br />
                {order.shipping.email}<br />
                {order.shipping.phone}<br />
                {order.shipping.address}, {order.shipping.city}, {order.shipping.state}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Items */}
            <h3 className="font-semibold mb-2">Items</h3>
            <table className="w-full mb-4">
              <thead>
                <tr className="text-sm text-gray-600 border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 text-sm">{item.name}</td>
                    <td className="py-2 text-sm text-center">{item.quantity}</td>
                    <td className="py-2 text-sm text-right">{formatNaira(item.price)}</td>
                    <td className="py-2 text-sm text-right">{formatNaira(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatNaira(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-teal-600">{formatNaira(order.totalAmount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>Thank you for shopping with BOLDVAN!</p>
              <p>For any inquiries, contact BOLDVANresourcesng@gmail.com</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 border-2 border-slate-200 hover:border-teal-500"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-2 border-slate-200 hover:border-teal-500"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipt;