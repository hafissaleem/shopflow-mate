import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact' })
      ]);
      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: 0,
        totalProducts: productsRes.count || 0
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, change: '+12.5%' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, change: '+8.2%' },
    { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, change: '+5.1%' },
    { title: 'Total Products', value: stats.totalProducts.toString(), icon: Package, change: '+2.4%' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-4 sm:mb-8 text-center py-2 sm:py-4">
        Welcome to Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="stats-card">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
              </div>
              <span className="flex items-center text-xs sm:text-sm text-success font-medium">
                {stat.change}
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
