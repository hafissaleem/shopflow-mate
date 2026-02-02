import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, MapPin, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const navItems = [
  { icon: User, label: 'Profile', href: '/dashboard' },
  { icon: Package, label: 'Orders', href: '/dashboard/orders' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function CustomerDashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold mb-8">My Account</h1>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <nav className="bg-card rounded-xl p-4 shadow-sm">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
