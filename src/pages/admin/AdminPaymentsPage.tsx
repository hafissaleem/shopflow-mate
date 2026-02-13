import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';

type PaymentStatus = Database['public']['Enums']['payment_status'];

interface Payment {
  id: string;
  order_number: string;
  user_id: string | null;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_details: any;
  total: number;
  created_at: string;
  customer_email?: string;
  customer_name?: string;
}

const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPayments = async () => {
    setIsLoading(true);
    
    // Payments are stored as part of orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, payment_method, payment_status, payment_details, total, created_at, shipping_address')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching payments:', error);
      setIsLoading(false);
      return;
    }

    // Get customer info for each order
    const paymentsWithCustomer = await Promise.all(
      (orders || []).map(async (order) => {
        const shippingAddr = order.shipping_address as Record<string, any> | null;
        let customerEmail = shippingAddr?.email || 'N/A';
        let customerName = shippingAddr?.full_name || 'Guest';
        
        if (order.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', order.user_id)
            .single();
          
          if (profile) {
            customerEmail = profile.email || customerEmail;
            customerName = profile.full_name || customerName;
          }
        }

        return {
          ...order,
          customer_email: customerEmail,
          customer_name: customerName,
        };
      })
    );

    setPayments(paymentsWithCustomer);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePaymentStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', paymentId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Payment status updated to ${newStatus}`,
    });
    fetchPayments();
  };

  const markAsPaid = async (paymentId: string) => {
    await handlePaymentStatusChange(paymentId, 'paid');
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const filteredPayments = payments.filter((p) =>
    p.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      upi: 'UPI',
      net_banking: 'Net Banking',
      wallet: 'Wallet',
      cod: 'Cash on Delivery',
      bank_transfer: 'Bank Transfer',
      pay_on_pickup: 'Pay on Pickup',
    };
    return labels[method] || method;
  };

  const isDirectPayment = (method: string) => {
    return ['cod', 'bank_transfer', 'pay_on_pickup'].includes(method);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-display font-bold mb-4 sm:mb-8">Payments</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="p-4 font-mono text-sm">{payment.order_number}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{payment.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{payment.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold">{formatCurrency(payment.total)}</td>
                    <td className="p-4">
                      <Select
                        value={payment.payment_status}
                        onValueChange={(value) => handlePaymentStatusChange(payment.id, value as PaymentStatus)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              <span className="capitalize">{status}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-sm">{formatDate(payment.created_at)}</td>
                    <td className="p-4 text-right space-x-1">
                      {isDirectPayment(payment.payment_method) && payment.payment_status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-success hover:text-success"
                          onClick={() => markAsPaid(payment.id)}
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewPaymentDetails(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">{selectedPayment.order_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedPayment.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPayment.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedPayment.payment_method)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedPayment.payment_status)}>
                    {selectedPayment.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedPayment.total)}</p>
              </div>

              {selectedPayment.payment_details && Object.keys(selectedPayment.payment_details).length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-sm mb-2">Payment Details</p>
                  <pre className="text-xs bg-secondary/50 p-3 rounded overflow-auto">
                    {JSON.stringify(selectedPayment.payment_details, null, 2)}
                  </pre>
                </div>
              )}

              {isDirectPayment(selectedPayment.payment_method) && selectedPayment.payment_status === 'pending' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    markAsPaid(selectedPayment.id);
                    setIsDialogOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
