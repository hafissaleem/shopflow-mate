import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import hasnaBanner from '@/assets/hasna-banner.jpg';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';

const demoCategories = [{
  id: '1', name: 'Electronics', slug: 'electronics',
  image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600'
}, {
  id: '2', name: 'Fashion', slug: 'fashion',
  image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600'
}, {
  id: '3', name: 'Home & Living', slug: 'home',
  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'
}, {
  id: '4', name: 'Sports', slug: 'sports',
  image: 'https://images.unsplash.com/photo-1461896836934-ez?w=600'
}];

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over Rs.5000' },
  { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy' },
  { icon: Shield, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: Headphones, title: '24/7 Support', description: 'Dedicated support' },
];

export default function HomePage() {
  const { data: featuredProducts } = useProducts({ featured: true, limit: 8 });
  const { data: allProducts } = useProducts({ limit: 8 });
  const { data: categories } = useCategories();
  const displayProducts = (featuredProducts?.length ? featuredProducts : allProducts) ?? [];
  const displayCategories = categories?.length ? categories : demoCategories;

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - App-like with banner visible on all screens */}
      <section className="relative overflow-hidden">
        {/* Banner Image - Full width on all screens */}
        <div className="w-full">
          <img
            src={hasnaBanner}
            alt="Hasna Cycle Center - Bicycle, Tricycle and All Kind of Bicycle Spare Parts & Repair"
            className="w-full h-40 sm:h-56 md:h-72 lg:h-96 object-cover"
          />
        </div>
        {/* Overlay CTA */}
        <div className="hero-gradient">
          <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                New Collection 2024
              </span>
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2 sm:mb-4 leading-tight max-w-xl">
                Premium Cycles &amp; Spare Parts
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-primary-foreground/80 mb-4 sm:mb-6 max-w-md">
                Quality bicycles, tricycles, spare parts & expert repairs at Hasna Cycle Center.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link to="/products">
                  <Button size="sm" className="btn-accent text-xs sm:text-sm h-9 sm:h-10">
                    Shop Now
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <Link to="/products?category=new">
                  <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm h-9 sm:h-10">
                    View Collection
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Compact horizontal scroll on mobile */}
      <section className="border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2.5 sm:gap-3 min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink"
              >
                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-[11px] sm:text-xs leading-tight">{feature.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {displayProducts.length > 0 && (
        <section className="py-6 sm:py-10 lg:py-16 bg-gradient-to-b from-accent/5 to-background">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-end justify-between mb-4 sm:mb-8 gap-2">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                  ⭐ Top Picks
                </span>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold">
                  Featured Products
                </h2>
              </div>
              <Link to="/products?featured=true" className="hidden sm:flex">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {displayProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            <div className="mt-5 text-center sm:hidden">
              <Link to="/products?featured=true">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-6 sm:py-10 lg:py-16 bg-secondary/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold mb-1 sm:mb-2">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Browse our curated collection across various categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {displayCategories.slice(0, 4).map((category, index) => (
              <motion.div
                key={category.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products?category=${'slug' in category ? category.slug : ''}`}
                  className="group block relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden"
                >
                  <img
                    src={'image' in category ? category.image : category.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                    <h3 className="text-white text-sm sm:text-lg font-semibold mb-0.5">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-[10px] sm:text-sm flex items-center gap-0.5">
                      Shop Now <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
