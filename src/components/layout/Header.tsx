import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut, Layers, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategoriesPanel } from '@/components/admin/CategoriesPanel';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesPanelOpen, setIsCategoriesPanelOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const navigate = useNavigate();
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const {
    itemCount
  } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

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
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-1 sm:gap-2">
          {/* Back Button */}
          <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0 flex-shrink">
            <span className="font-display font-bold text-[#ba3b98] text-left text-xl sm:text-2xl md:text-3xl lg:text-5xl truncate">Hasna Cycle Center</span>
          </Link>

          {/* Desktop Navigation */}
          

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-accent" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Categories Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                  <Layers className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem asChild>
                  <Link to="/products" className="cursor-pointer font-medium">All Products</Link>
                </DropdownMenuItem>
                {categories.length > 0 && <DropdownMenuSeparator />}
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link to={`/products?category=${cat.slug}`} className="cursor-pointer">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {isAdmin && <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsCategoriesPanelOpen(true)} className="cursor-pointer text-accent font-medium">
                    Manage Categories
                  </DropdownMenuItem>
                </>}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/wishlist" className="hidden sm:flex">
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                <ShoppingCart className="h-5 w-5" />
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
                <DropdownMenuContent align="end" className="w-48 bg-popover">
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
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.slug}`} className="py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Categories Panel (Admin only) */}
      <CategoriesPanel open={isCategoriesPanelOpen} onOpenChange={setIsCategoriesPanelOpen} />
    </header>;
}