import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/lib/supabase-types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-32" />
          <div className="h-24 bg-secondary rounded" />
          <div className="h-24 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 shadow-sm text-center">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <Link to="/products">
          <Button className="btn-accent">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Order History</h2>
      
      {orders.map((order) => (
        <div key={order.id} className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono font-semibold">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge className={getStatusColor(order.payment_status)}>
              Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
            <Link to={`/dashboard/orders/${order.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
