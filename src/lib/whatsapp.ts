import { formatCurrency } from './utils';

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

interface OrderDetails {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string;
}

/**
 * Format order details into a friendly, professional WhatsApp message
 */
export function formatOrderForWhatsApp(order: OrderDetails): string {
  const lines: string[] = [];

  // Recalculate total to ensure accuracy
  const correctTotal = order.subtotal + order.tax + order.shipping;

  lines.push('*New Order Received*');
  lines.push(`Order No: *${order.orderNumber}*`);
  lines.push('');

  // Customer Details
  lines.push('*Customer Details*');
  lines.push(`Name: ${order.shippingAddress.full_name}`);
  lines.push(`Phone: ${order.shippingAddress.phone}`);
  lines.push('');

  // Delivery Address
  lines.push('*Delivery Address*');
  const addressParts = [order.shippingAddress.address_line1];
  if (order.shippingAddress.address_line2) {
    addressParts.push(order.shippingAddress.address_line2);
  }
  addressParts.push(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}`);
  lines.push(addressParts.join(', '));
  lines.push('');

  // Order Items
  lines.push('*Order Items*');
  order.items.forEach((item, index) => {
    const itemTotal = item.unit_price * item.quantity;
    lines.push(`${index + 1}. ${item.product_name}`);
    lines.push(`   ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(itemTotal)}`);
  });
  lines.push('');

  // Order Summary
  lines.push('*Order Summary*');
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  if (order.tax > 0) {
    lines.push(`Tax: ${formatCurrency(order.tax)}`);
  }
  lines.push(`Shipping: ${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}`);
  lines.push(`Total: *${formatCurrency(correctTotal)}*`);
  lines.push('');
  lines.push(`Payment: Cash on Delivery`);

  // Notes
  if (order.notes?.trim()) {
    lines.push('');
    lines.push(`Note: ${order.notes}`);
  }

  lines.push('');
  lines.push('Thank you! We will contact you soon to confirm your order.');

  return lines.join('\n');
}

/**
 * Generate a WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const number = phoneNumber.replace(/\D/g, '');
  if (!number || number.length < 10 || number.length > 15) {
    if (import.meta.env.DEV) console.warn('[WhatsApp] Invalid number:', phoneNumber);
    return '';
  }
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Generate a simple inquiry message for customer care
 */
export function generateInquiryMessage(productName?: string): string {
  if (productName) {
    return `Hi! I have a question about *${productName}*. Can you help me?`;
  }
  return 'Hi! I have a question. Can you help me?';
}
