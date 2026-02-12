import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-base sm:text-xl font-display font-bold">Hasna Cycle Center</span>
            </Link>
            <p className="text-primary-foreground/70 text-xs sm:text-sm mb-3">
              Premium cycles, spare parts & expert repairs.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm mb-3">Quick Links</h4>
            <ul className="space-y-1.5">
              {[
                { to: '/products', label: 'All Products' },
                { to: '/products?featured=true', label: 'Featured' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/70 hover:text-white text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm mb-3">Help</h4>
            <ul className="space-y-1.5">
              {[
                { to: '/dashboard', label: 'My Account' },
                { to: '/dashboard/orders', label: 'Track Order' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/70 hover:text-white text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-xs sm:text-sm mb-3">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                <a href="mailto:support@hasnacyclecenter.com" className="text-primary-foreground/70 hover:text-white text-xs sm:text-sm transition-colors break-all">
                  support@hasnacyclecenter.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <p className="text-primary-foreground/50 text-[10px] sm:text-xs text-center">
            © {new Date().getFullYear()} Hasna Cycle Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
