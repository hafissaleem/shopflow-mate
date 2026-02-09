import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface ShippingFormProps {
  shippingAddress: ShippingAddress;
  onAddressChange: (address: ShippingAddress) => void;
  orderNotes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ShippingForm({
  shippingAddress,
  onAddressChange,
  orderNotes,
  onNotesChange,
  onSubmit,
}: ShippingFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-xl p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold mb-6">Your Details & Delivery Address</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              required
              maxLength={100}
              value={shippingAddress.full_name}
              onChange={(e) => onAddressChange({ ...shippingAddress, full_name: e.target.value })}
              className="mt-1.5"
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              maxLength={20}
              value={shippingAddress.phone}
              onChange={(e) => onAddressChange({ ...shippingAddress, phone: e.target.value })}
              className="mt-1.5"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address_line1">Address Line 1 *</Label>
          <Input
            id="address_line1"
            required
            maxLength={200}
            value={shippingAddress.address_line1}
            onChange={(e) => onAddressChange({ ...shippingAddress, address_line1: e.target.value })}
            className="mt-1.5"
            placeholder="House number, street name"
          />
        </div>

        <div>
          <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
          <Input
            id="address_line2"
            maxLength={200}
            value={shippingAddress.address_line2}
            onChange={(e) => onAddressChange({ ...shippingAddress, address_line2: e.target.value })}
            className="mt-1.5"
            placeholder="Apartment, landmark, etc."
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              required
              maxLength={100}
              value={shippingAddress.city}
              onChange={(e) => onAddressChange({ ...shippingAddress, city: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              required
              maxLength={100}
              value={shippingAddress.state}
              onChange={(e) => onAddressChange({ ...shippingAddress, state: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="postal_code">PIN Code *</Label>
            <Input
              id="postal_code"
              required
              maxLength={10}
              value={shippingAddress.postal_code}
              onChange={(e) => onAddressChange({ ...shippingAddress, postal_code: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="order_notes">Order Notes (Optional)</Label>
          <Textarea
            id="order_notes"
            maxLength={500}
            value={orderNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="mt-1.5"
            placeholder="Any special instructions for your order..."
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full btn-accent mt-6">
          Review & Place Order
        </Button>
      </form>
    </motion.div>
  );
}
