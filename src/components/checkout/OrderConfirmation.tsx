import { CheckCircle2, MessageCircle, Send, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { formatOrderForWhatsApp, generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
}

interface OrderConfirmationProps {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string;
  onContinueShopping: () => void;
  onViewOrders: () => void;
}

export function OrderConfirmation({
  orderNumber,
  items,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
  notes,
  onContinueShopping,
  onViewOrders,
}: OrderConfirmationProps) {
  const { settings } = useStoreSettings();
  const adminNumber = settings.whatsapp_admin_number;
  const customerCareNumber = settings.whatsapp_customer_care_number;

  const whatsappMessage = formatOrderForWhatsApp({
    orderNumber,
    items,
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
    notes,
  });

  const adminWhatsAppLink = adminNumber
    ? generateWhatsAppLink(adminNumber, whatsappMessage)
    : '';

  const customerCareLink = customerCareNumber
    ? generateWhatsAppLink(
        customerCareNumber,
        `Hi! I just placed order *${orderNumber}*. I'd like to confirm my order details.`
      )
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl p-4 sm:p-8 shadow-sm"
    >
      {/* Success Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-success" />
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">Order Submitted!</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your order has been saved. To confirm it, please send the details to our admin via WhatsApp.
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 inline-block mt-4">
          <p className="text-sm text-muted-foreground">Order Number</p>
          <p className="text-xl font-mono font-bold">{orderNumber}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-secondary/30 rounded-lg p-5 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.product_name} × {item.quantity}
              </span>
              <span className="font-medium">{formatCurrency(item.total_price)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-1">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-secondary/30 rounded-lg p-5 mb-6">
        <h3 className="font-semibold mb-2">📍 Delivery Address</h3>
        <p className="text-sm text-muted-foreground">
          {shippingAddress.full_name}<br />
          {shippingAddress.phone}<br />
          {shippingAddress.address_line1}<br />
          {shippingAddress.address_line2 && <>{shippingAddress.address_line2}<br /></>}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
        </p>
        {notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm"><span className="font-medium">Notes:</span> {notes}</p>
          </div>
        )}
      </div>

      {/* WhatsApp Actions */}
      <div className="space-y-3">
        {/* Primary: Send to Admin */}
        {adminWhatsAppLink ? (
          <a
            href={adminWhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full h-14 text-base gap-3 font-semibold" style={{ backgroundColor: '#25D366' }}>
              <Send className="h-5 w-5" />
              Send Order to Admin via WhatsApp
            </Button>
          </a>
        ) : (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 text-center">
            <p className="text-sm text-warning font-medium">
              Admin WhatsApp number not configured. Please contact the store.
            </p>
          </div>
        )}

        {/* Secondary: Contact Customer Care */}
        {customerCareLink && (
          <a
            href={customerCareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full h-12 gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: '#25D366' }} />
              Contact Customer Care
            </Button>
          </a>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">📋 How it works:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click "Send Order to Admin via WhatsApp" above</li>
          <li>WhatsApp will open with your order details pre-filled</li>
          <li>Send the message to confirm your order</li>
          <li>Our team will process and confirm your order</li>
        </ol>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button variant="outline" onClick={onViewOrders}>
          View My Orders
        </Button>
        <Button variant="ghost" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      </div>
    </motion.div>
  );
}
