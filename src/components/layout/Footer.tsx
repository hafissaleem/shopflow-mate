import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-display font-semibold mb-2">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Get the latest updates on new arrivals and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button className="btn-accent whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-display font-bold">LUXE</span>
              <span className="text-xs font-medium text-accent uppercase tracking-widest">Store</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Discover premium products curated for the modern lifestyle. Quality meets elegance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard/orders" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  Returns & Exchanges
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/70 text-sm">
                  123 Commerce Street<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a href="tel:+1234567890" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a href="mailto:support@luxestore.com" className="text-primary-foreground/70 hover:text-white text-sm transition-colors">
                  support@luxestore.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} LUXE Store. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-primary-foreground/50 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/50 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
