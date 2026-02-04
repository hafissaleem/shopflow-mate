import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Eye, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image: string | null;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax: number | null;
  shipping_cost: number | null;
  total: number;
  shipping_address: any;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    
    // Fetch orders
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
      return;
    }

    // Fetch profile info for each order
    const ordersWithProfiles = await Promise.all(
      (ordersData || []).map(async (order) => {
        let profile = null;
        if (order.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', order.user_id)
            .single();
          profile = profileData;
        }
        return { ...order, profile };
      })
    );

    setOrders(ordersWithProfiles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Order status updated to ${newStatus}`,
    });
    fetchOrders();
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    setOrderItems(data || []);
    setIsDialogOpen(true);
  };

  const getCustomerInfo = (order: Order) => {
    if (order.profile?.full_name || order.profile?.email) {
      return {
        name: order.profile.full_name || 'N/A',
        email: order.profile.email || 'N/A',
      };
    }
    // Fallback to shipping address
    const addr = order.shipping_address;
    return {
      name: addr?.full_name || 'Guest',
      email: addr?.email || 'N/A',
    };
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Orders</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Total</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customer = getCustomerInfo(order);
                  return (
                    <tr key={order.id} className="border-t border-border hover:bg-secondary/20">
                      <td className="p-4 font-mono text-sm">{order.order_number}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{formatDate(order.created_at)}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge className={getStatusColor(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                          <p className="text-xs text-muted-foreground capitalize">
                            {order.payment_method.replace('_', ' ')}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className="capitalize">{status}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right font-bold">{formatCurrency(order.total)}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{getCustomerInfo(selectedOrder).name}</p>
                  <p>{getCustomerInfo(selectedOrder).email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipping Address</p>
                  <p className="font-medium">
                    {selectedOrder.shipping_address?.address_line1}
                  </p>
                  <p>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-3">Items</p>
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(selectedOrder.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
