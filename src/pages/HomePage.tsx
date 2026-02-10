import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import hasnaBanner from '@/assets/hasna-banner.jpg';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';

// Demo products for initial display
const demoProducts = [{
  id: '1',
  name: 'Premium Wireless Headphones',
  slug: 'premium-wireless-headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 299.99,
  compare_at_price: 399.99,
  category_id: '1',
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
  stock_quantity: 50,
  is_featured: true,
  is_active: true,
  rating: 4.8,
  review_count: 124,
  specifications: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: null,
    image_url: null,
    created_at: '',
    updated_at: ''
  }
}, {
  id: '2',
  name: 'Minimalist Leather Watch',
  slug: 'minimalist-leather-watch',
  description: 'Elegant timepiece with genuine leather strap',
  price: 189.99,
  compare_at_price: null,
  category_id: '2',
  images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
  stock_quantity: 30,
  is_featured: true,
  is_active: true,
  rating: 4.9,
  review_count: 89,
  specifications: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: null,
    image_url: null,
    created_at: '',
    updated_at: ''
  }
}, {
  id: '3',
  name: 'Smart Fitness Tracker',
  slug: 'smart-fitness-tracker',
  description: 'Track your health and fitness goals',
  price: 149.99,
  compare_at_price: 199.99,
  category_id: '1',
  images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?w=600'],
  stock_quantity: 75,
  is_featured: true,
  is_active: true,
  rating: 4.6,
  review_count: 203,
  specifications: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: null,
    image_url: null,
    created_at: '',
    updated_at: ''
  }
}, {
  id: '4',
  name: 'Designer Sunglasses',
  slug: 'designer-sunglasses',
  description: 'UV protection with premium style',
  price: 129.99,
  compare_at_price: null,
  category_id: '2',
  images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'],
  stock_quantity: 45,
  is_featured: false,
  is_active: true,
  rating: 4.7,
  review_count: 67,
  specifications: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: null,
    image_url: null,
    created_at: '',
    updated_at: ''
  }
}];
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
    data: products
  } = useProducts({
    featured: true,
    limit: 8
  });
  const {
    data: categories
  } = useCategories();
  const displayProducts = products?.length ? products : demoProducts;
  const displayCategories = categories?.length ? categories : demoCategories;
  return <div>
      {/* Store Banner */}
      <section className="w-full">
        <img
          src={hasnaBanner}
          alt="Hasna Cycle Center - Bicycle, Tricycle and All Kind of Bicycle Spare Parts & Repair"
          className="w-full h-auto block"
        />
      </section>

      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                Discover Premium Products for Modern Living
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
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
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" alt="Premium shopping experience" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-2xl font-bold text-foreground">$49.99</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our curated collection across various categories
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* CTA Banner */}
      
    </div>;
}