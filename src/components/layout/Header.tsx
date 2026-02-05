import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const {
    itemCount
  } = useCart();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-7xl text-[#ba3b98]">
               Hasna Cycle Center
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-[35px]">
            <Link to="/products" className="font-medium text-foreground/80 hover:text-foreground transition-colors text-base">
              All Products
            </Link>
            <Link to="/products?category=electronics" className="font-medium text-foreground/80 hover:text-foreground transition-colors text-base">
              Electronics
            </Link>
            <Link to="/products?category=fashion" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Fashion
            </Link>
            <Link to="/products?category=home" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Home & Living
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-accent" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-[8px] shadow-none text-[#dc95f3]">
            <Link to="/wishlist" className="hidden sm:flex">
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                <ShoppingCart className="w-5 text-[#d74242] h-[40px]" />
                {itemCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {itemCount}
                  </span>}
              </Button>
            </Link>

            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/orders" className="cursor-pointer">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer font-semibold text-accent">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Link to="/auth">
                <Button variant="default" size="sm" className="hidden sm:flex">
                  Sign In
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden text-foreground/80 hover:text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden text-foreground/80" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="lg:hidden border-t border-border/50 bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch} className="md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </form>
              <nav className="flex flex-col gap-2">
                <Link to="/products" className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  All Products
                </Link>
                <Link to="/products?category=electronics" className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  Electronics
                </Link>
                <Link to="/products?category=fashion" className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  Fashion
                </Link>
                <Link to="/products?category=home" className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  Home & Living
                </Link>
              </nav>
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}