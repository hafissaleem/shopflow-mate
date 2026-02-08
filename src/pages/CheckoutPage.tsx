import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Building2, Smartphone, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, generateOrderNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { PaymentMethodType } from '@/lib/supabase-types';

const paymentMethods = [
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, type: 'online' },
  { id: 'debit_card', label: 'Debit Card', icon: CreditCard, type: 'online' },
  { id: 'upi', label: 'UPI', icon: Smartphone, type: 'online' },
  { id: 'net_banking', label: 'Net Banking', icon: Building2, type: 'online' },
  { id: 'wallet', label: 'Digital Wallet', icon: Wallet, type: 'online' },
  { id: 'cod', label: 'Cash on Delivery', icon: Truck, type: 'direct' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, type: 'direct' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('credit_card');
  
  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
  });

  const [orderNumber, setOrderNumber] = useState('');

  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const isDirectPayment = ['cod', 'bank_transfer', 'pay_on_pickup'].includes(selectedPayment);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    setIsLoading(true);

    try {
      const newOrderNumber = generateOrderNumber();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          user_id: user.id,
          status: 'pending',
          subtotal,
          tax,
          shipping_cost: shipping,
          total,
          shipping_address: shippingAddress,
          payment_method: selectedPayment,
          payment_status: isDirectPayment ? 'pending' : 'paid', // Online payments are marked paid immediately for demo
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Product',
        product_image: item.product?.images?.[0] || null,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();
      
      setOrderNumber(newOrderNumber);
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {['Shipping', 'Payment', 'Confirmation'].map((label, index) => {
            const stepIndex = ['shipping', 'payment', 'confirmation'].indexOf(step);
            const isActive = index <= stepIndex;
            const isCurrent = index === stepIndex;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 font-medium transition-colors ${
                  isActive 
                    ? 'bg-accent border-accent text-white' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {isActive && index < stepIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${index < stepIndex ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        required
                        value={shippingAddress.full_name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      required
                      value={shippingAddress.address_line1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address_line2"
                      value={shippingAddress.address_line2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">ZIP Code</Label>
                      <Input
                        id="postal_code"
                        required
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-accent mt-6">
                    Continue to Payment
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                
                {/* Online Payments */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Online Payment</h3>
                  <RadioGroup value={selectedPayment} onValueChange={(v) => setSelectedPayment(v as PaymentMethodType)}>
                    <div className="grid gap-3">
                      {paymentMethods.filter(m => m.type === 'online').map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedPayment === method.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <RadioGroupItem value={method.id} />
                          <method.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Direct Payments */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Direct Payment</h3>
                  <RadioGroup value={selectedPayment} onValueChange={(v) => setSelectedPayment(v as PaymentMethodType)}>
                    <div className="grid gap-3">
                      {paymentMethods.filter(m => m.type === 'direct').map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedPayment === method.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <RadioGroupItem value={method.id} />
                          <method.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {isDirectPayment && (
                  <div className="mt-4 p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning">
                      Payment will be collected upon delivery/pickup. Your order will be confirmed immediately.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep('shipping')}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 btn-accent" 
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : `Place Order - ${formatCurrency(total)}`}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl p-8 shadow-sm text-center"
              >
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your order. We've sent a confirmation email with order details.
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 inline-block mb-6">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-mono font-bold">{orderNumber}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/dashboard/orders')}>
                    View Order Details
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    Continue Shopping
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] && (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
