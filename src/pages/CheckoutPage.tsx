import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { supabase } from '@/integrations/supabase/client';
import { generateOrderNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useStoreSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'confirmation'>('shipping');
  const [orderNotes, setOrderNotes] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  const [orderNumber, setOrderNumber] = useState('');
  const [confirmedItems, setConfirmedItems] = useState<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[]>([]);

  // Dynamic tax & shipping from admin settings
  const taxRate = settings.tax_enabled !== 'false' ? Number(settings.tax_rate) / 100 : 0;
  const tax = subtotal * taxRate;
  const freeShippingEnabled = settings.shipping_enable_free !== 'false';
  const freeShippingThreshold = Number(settings.shipping_free_threshold) || 1000;
  const flatRate = Number(settings.shipping_flat_rate) || 50;
  const shipping = freeShippingEnabled && subtotal >= freeShippingThreshold ? 0 : flatRate;
  const total = subtotal + tax + shipping;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    setIsLoading(true);

    try {
      const newOrderNumber = generateOrderNumber();
      
      // Create order with COD payment (no online payment processing)
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
          payment_method: 'cod' as const,
          payment_status: 'pending' as const,
          notes: orderNotes || null,
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

      // Store confirmed items for the confirmation page
      setConfirmedItems(orderItems.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })));

      // Clear cart
      await clearCart();
      
      setOrderNumber(newOrderNumber);
      setStep('confirmation');
      toast.success('Order submitted! Send it to our admin via WhatsApp to confirm.');
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
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          {['Your Details', 'Confirmation'].map((label, index) => {
            const stepIndex = ['shipping', 'confirmation'].indexOf(step);
            const isActive = index <= stepIndex;
            const isCurrent = index === stepIndex;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 font-medium text-sm sm:text-base transition-colors ${
                  isActive 
                    ? 'bg-accent border-accent text-white' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {isActive && index < stepIndex ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {index < 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${index < stepIndex ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <ShippingForm
                shippingAddress={shippingAddress}
                onAddressChange={setShippingAddress}
                orderNotes={orderNotes}
                onNotesChange={setOrderNotes}
                onSubmit={handleShippingSubmit}
              />
            )}

            {step === 'confirmation' && (
              <OrderConfirmation
                orderNumber={orderNumber}
                items={confirmedItems}
                subtotal={subtotal || confirmedItems.reduce((sum, i) => sum + i.total_price, 0)}
                tax={tax || confirmedItems.reduce((sum, i) => sum + i.total_price, 0) * 0.1}
                shipping={shipping}
                total={total || confirmedItems.reduce((sum, i) => sum + i.total_price, 0) * 1.1 + (shipping || 0)}
                shippingAddress={shippingAddress}
                notes={orderNotes}
                onContinueShopping={() => navigate('/products')}
                onViewOrders={() => navigate('/dashboard/orders')}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-1">
              <CheckoutOrderSummary
                items={items}
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                total={total}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
