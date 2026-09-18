import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, ShoppingBag, Home, User, Loader2, Package } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ReceiptData {
  businessName: string;
  orderNumber: string;
  orderId: string;
  razorpayPaymentId: string;
  customer: { name: string; email: string };
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  paidAt: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!orderId || fetchedRef.current) return;
    fetchedRef.current = true;

    api.get(`/orders/${orderId}/receipt`)
      .then(({ data }) => {
        if (data.success) {
          setReceipt(data.data);
        } else {
          setError("Could not load order details.");
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.error?.message || err.response?.data?.message || "Could not load receipt.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const generateReceiptHTML = (data: ReceiptData) => {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 600;">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.orderNumber}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 700px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #d4af37; font-size: 28px; margin: 0 0 8px; }
          .header p { color: #666; font-size: 13px; margin: 0; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .meta-item { font-size: 13px; color: #555; }
          .meta-item strong { display: block; color: #1a1a1a; font-size: 14px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          thead th { text-align: left; padding: 12px 8px; background: #faf8f4; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 2px solid #eee; }
          .totals { margin-top: 20px; text-align: right; }
          .totals .row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; font-size: 14px; }
          .totals .row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #d4af37; padding-top: 12px; margin-top: 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .badge-paid { background: #dcfce7; color: #166534; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✨ ${data.businessName}</h1>
          <p>Purchase Receipt</p>
        </div>
        <div class="meta">
          <div class="meta-item">Order Number<strong>${data.orderNumber}</strong></div>
          <div class="meta-item">Date<strong>${new Date(data.paidAt || data.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
          <div class="meta-item">Payment<strong><span class="badge badge-paid">${data.paymentStatus}</span></strong></div>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Customer</p>
          <p style="font-size: 14px; margin: 0; font-weight: 600;">${data.customer.name}</p>
          <p style="font-size: 13px; color: #555; margin: 2px 0 0;">${data.customer.email}</p>
        </div>
        ${data.razorpayPaymentId ? `<p style="font-size: 12px; color: #888;">Payment Ref: ${data.razorpayPaymentId}</p>` : ''}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>₹${data.subtotal.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Shipping</span><span>${data.shippingCharge === 0 ? 'Free' : '₹' + data.shippingCharge.toLocaleString('en-IN')}</span></div>
          <div class="row total"><span>Total Paid</span><span>₹${data.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for shopping with ${data.businessName}!</p>
          <p>For any queries, contact us at hello@divinewheeloffortune.com</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = () => {
    if (!receipt) return;
    const html = generateReceiptHTML(receipt);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Popup blocked", description: "Please allow popups to download the receipt.", variant: "destructive" });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = async () => {
    if (!receipt) return;
    const shareData = {
      title: `Order Receipt - ${receipt.orderNumber}`,
      text: `Purchase receipt from ${receipt.businessName}\nOrder: ${receipt.orderNumber}\nTotal: ₹${receipt.totalAmount.toLocaleString('en-IN')}\nDate: ${new Date(receipt.paidAt || receipt.orderDate).toLocaleDateString('en-IN')}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled sharing — not an error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({ title: "Copied to clipboard", description: "Receipt details have been copied." });
      } catch {
        toast({ title: "Share not available", description: "Your browser doesn't support sharing.", variant: "destructive" });
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-32 min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !receipt) {
    return (
      <Layout>
        <div className="container max-w-lg mx-auto py-28 text-center min-h-[60vh]">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl mb-3">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || "We couldn't find this order."}</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-24 md:py-28 px-4">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl text-foreground mb-3"
          >
            Payment Successful!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-muted-foreground"
          >
            Thank you for your purchase. Your order has been confirmed.
          </motion.p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-[#faf8f4] to-[#f5f0e6] px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b5952f] mb-1">Purchase Receipt</p>
                <h2 className="font-serif text-lg text-slate-900">{receipt.businessName}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                {receipt.paymentStatus}
              </span>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Order Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Order Number</p>
                <p className="font-medium text-slate-800">{receipt.orderNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Date</p>
                <p className="font-medium text-slate-800">
                  {new Date(receipt.paidAt || receipt.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Customer</p>
                <p className="font-medium text-slate-800">{receipt.customer.name}</p>
              </div>
              {receipt.razorpayPaymentId && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Payment Ref</p>
                  <p className="font-medium text-slate-800 text-xs break-all">{receipt.razorpayPaymentId}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Items Purchased</p>
              <div className="space-y-3">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="font-semibold text-slate-800">₹{item.total.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">₹{receipt.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="text-slate-700">
                  {receipt.shippingCharge === 0 ? 'Free' : `₹${receipt.shippingCharge.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between font-serif text-xl pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>₹{receipt.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-3">
            <Button onClick={handleDownload} variant="outline" className="flex-1 min-w-[140px] gap-2">
              <Download className="w-4 h-4" /> Download Receipt
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[140px] gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild size="lg" className="gap-2 rounded-xl">
            <Link to="/products">
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
            <Link to="/">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
            <Link to="/profile">
              <User className="w-4 h-4" /> View Profile
            </Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
