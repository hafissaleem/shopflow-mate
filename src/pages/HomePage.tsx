import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import hasnaBanner from '@/assets/hasna-banner.jpg';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';



const demoCategories = [{
  id: '1',
  name: 'Electronics',
  slug: 'electronics',
  image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600'
}, {
  id: '2',
  name: 'Fashion',
  slug: 'fashion',
  image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600'
}, {
  id: '3',
  name: 'Home & Living',
  slug: 'home',
  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'
}, {
  id: '4',
  name: 'Sports',
  slug: 'sports',
  image: 'https://images.unsplash.com/photo-1461896836934- voices-photo?w=600'
}];
const features = [{
  icon: Truck,
  title: 'Free Shipping',
  description: 'On orders over $100'
}, {
  icon: RefreshCw,
  title: 'Easy Returns',
  description: '30-day return policy'
}, {
  icon: Shield,
  title: 'Secure Payment',
  description: '100% secure checkout'
}, {
  icon: Headphones,
  title: '24/7 Support',
  description: 'Dedicated support team'
}];
export default function HomePage() {
  const {
    data: featuredProducts
  } = useProducts({
    featured: true,
    limit: 8
  });
  const {
    data: allProducts
  } = useProducts({
    limit: 8
  });
  const {
    data: categories
  } = useCategories();
  // Show featured products if any, otherwise show all products
  const displayProducts = (featuredProducts?.length ? featuredProducts : allProducts) ?? [];
  const displayCategories = categories?.length ? categories : demoCategories;
  return <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-10 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.6
          }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
                New Collection 2024
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6 leading-tight">
                Discover Premium Products for Modern Living
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg">
                Curated selection of high-quality products designed to elevate your lifestyle. 
                Experience luxury at accessible prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="btn-accent text-base">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products?category=new">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                    View Collection
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="relative hidden lg:block">
              <div className="rounded-3xl overflow-hidden">
                <img src={hasnaBanner} alt="Hasna Cycle Center - Bicycle, Tricycle and All Kind of Bicycle Spare Parts & Repair" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Featured Products - Prominent Section */}
      {displayProducts.length > 0 && (
        <section className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-accent/5 to-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                  ⭐ Top Picks
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2">
                  Featured Products
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Handpicked selections our customers love
                </p>
              </div>
              <Link to="/products?featured=true" className="hidden md:flex">
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {displayProducts.slice(0, 8).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/products?featured=true">
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-10 sm:py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our curated collection across various categories
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {displayCategories.slice(0, 4).map((category, index) => <motion.div key={category.id || index} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Link to={`/products?category=${'slug' in category ? category.slug : ''}`} className="group block relative aspect-[4/5] rounded-2xl overflow-hidden">
                  <img src={'image' in category ? category.image : category.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-semibold mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      Shop Now <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      
    </div>;
}