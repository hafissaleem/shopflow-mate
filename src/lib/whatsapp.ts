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
 * Format order details into a clean WhatsApp message
 */
export function formatOrderForWhatsApp(order: OrderDetails): string {
  const lines: string[] = [];

  lines.push('🛒 *NEW ORDER*');
  lines.push(`📋 Order: *${order.orderNumber}*`);
  lines.push('');

  // Customer info
  lines.push('👤 *Customer Details:*');
  lines.push(`Name: ${order.shippingAddress.full_name}`);
  lines.push(`Phone: ${order.shippingAddress.phone}`);
  lines.push('');

  // Delivery address
  lines.push('📍 *Delivery Address:*');
  lines.push(order.shippingAddress.address_line1);
  if (order.shippingAddress.address_line2) {
    lines.push(order.shippingAddress.address_line2);
  }
  lines.push(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}`);
  lines.push('');

  // Items
  lines.push('📦 *Order Items:*');
  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.product_name}`);
    lines.push(`   Qty: ${item.quantity} × ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}`);
  });
  lines.push('');

  // Totals
  lines.push('💰 *Order Summary:*');
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  if (order.tax > 0) {
    lines.push(`Tax: ${formatCurrency(order.tax)}`);
  }
  lines.push(`Shipping: ${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}`);
  lines.push(`*Total: ${formatCurrency(order.total)}*`);

  // Notes
  if (order.notes?.trim()) {
    lines.push('');
    lines.push(`📝 *Notes:* ${order.notes}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('_Sent from Hasna Cycle Center website_');

  return lines.join('\n');
}

/**
 * Generate a WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Strip to digits only for wa.me format
  const number = phoneNumber.replace(/\D/g, '');
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
