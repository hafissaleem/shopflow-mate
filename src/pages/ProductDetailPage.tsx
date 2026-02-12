import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, Heart, ShoppingCart, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/lib/supabase-types';

const demoProduct: Product = {
  id: '1',
  name: 'Premium Wireless Headphones',
  slug: 'premium-wireless-headphones',
  description: 'Experience exceptional sound quality with our Premium Wireless Headphones. Featuring advanced noise cancellation technology, these headphones deliver crystal-clear audio for music, calls, and gaming. The memory foam ear cushions provide hours of comfortable listening, while the 40-hour battery life ensures uninterrupted entertainment.',
  price: 299.99,
  compare_at_price: 399.99,
  category_id: '1',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
  ],
  stock_quantity: 50,
  is_featured: true,
  is_active: true,
  rating: 4.8,
  review_count: 124,
  specifications: {
    'Driver Size': '40mm',
    'Frequency Response': '20Hz - 20kHz',
    'Battery Life': '40 hours',
    'Connectivity': 'Bluetooth 5.2',
    'Weight': '250g',
    'Noise Cancellation': 'Active',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts } = useProducts({ limit: 4 });
  const { addToCart } = useCart();

  const displayProduct = product || demoProduct;
  const images = displayProduct.images?.length ? displayProduct.images : ['/placeholder.svg'];

  const discount = displayProduct.compare_at_price 
    ? Math.round((1 - displayProduct.price / displayProduct.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(displayProduct, quantity);
  };

  const handleBuyNow = () => {
    addToCart(displayProduct, quantity);
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-secondary rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-secondary rounded w-3/4" />
            <div className="h-6 bg-secondary rounded w-1/4" />
            <div className="h-32 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-8 text-sm overflow-x-auto">
          <ol className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            <li><a href="/" className="hover:text-foreground">Home</a></li>
            <li>/</li>
            <li><a href="/products" className="hover:text-foreground">Products</a></li>
            <li>/</li>
            <li className="text-foreground truncate max-w-[150px] sm:max-w-none">{displayProduct.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={displayProduct.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="badge-sale">-{discount}% OFF</span>
                )}
                {displayProduct.is_featured && (
                  <span className="badge-new">Featured</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      index === currentImageIndex ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {displayProduct.category && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {typeof displayProduct.category === 'object' ? displayProduct.category.name : ''}
              </p>
            )}
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4">
              {displayProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(displayProduct.rating)
                        ? 'text-accent fill-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {displayProduct.rating} ({displayProduct.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(displayProduct.price)}
              </span>
              {displayProduct.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(displayProduct.compare_at_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-medium text-destructive">
                  Save {formatCurrency(displayProduct.compare_at_price! - displayProduct.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-8">
              {displayProduct.description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {displayProduct.stock_quantity > 0 ? (
                <p className="text-sm text-success font-medium">
                  ✓ In Stock ({displayProduct.stock_quantity} available)
                </p>
              ) : (
                <p className="text-sm text-destructive font-medium">
                  Out of Stock
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= displayProduct.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1 btn-accent"
                onClick={handleAddToCart}
                disabled={displayProduct.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="default"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={displayProduct.stock_quantity === 0}
              >
                Buy Now
              </Button>
              <Button size="lg" variant="outline" className="sm:w-auto">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-xs font-medium">2-Year Warranty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 sm:mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-3 sm:px-6 py-3 text-xs sm:text-sm"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-3 sm:px-6 py-3 text-xs sm:text-sm"
              >
                Specs
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-3 sm:px-6 py-3 text-xs sm:text-sm"
              >
                Reviews ({displayProduct.review_count})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-8">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {displayProduct.description}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="py-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(displayProduct.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-8">
              <p className="text-muted-foreground">
                Reviews will be displayed here once customers start leaving feedback.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-8 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-display font-bold mb-6 sm:mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {(relatedProducts || []).slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
