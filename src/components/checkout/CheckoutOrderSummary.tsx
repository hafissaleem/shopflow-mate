import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/lib/supabase-types';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function CheckoutOrderSummary({ items, subtotal, tax, shipping, total }: CheckoutOrderSummaryProps) {
  return (
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

      <p className="text-xs text-muted-foreground text-center mt-4">
        No online payment required. Pay upon delivery or pickup.
      </p>
    </div>
  );
}
