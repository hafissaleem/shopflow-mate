import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/supabase-types';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = product.compare_at_price 
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug}`} className="block product-card group">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="badge-sale">-{discount}%</span>
            )}
            {product.is_featured && (
              <span className="badge-new">Featured</span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-white shadow-md hover:bg-white/90"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button 
              className="w-full btn-accent"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-medium text-foreground line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          {(product.rating ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.rating ?? 0)
                        ? 'text-accent fill-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.review_count ?? 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
