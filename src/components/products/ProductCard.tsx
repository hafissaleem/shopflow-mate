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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link to={`/products/${product.slug}`} className="block product-card group">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-accent text-white">
                Featured
              </span>
            )}
          </div>

          {/* Quick Actions - Desktop only */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-white/90"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Add to Cart - Slide up on hover (desktop), always visible icon on mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
            <Button className="w-full btn-accent text-xs h-8 sm:h-9" onClick={handleAddToCart}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          </div>

          {/* Mobile: Small cart icon */}
          <button
            className="sm:hidden absolute bottom-2 right-2 h-7 w-7 rounded-full bg-accent text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-2 sm:p-3">
          {product.category && (
            <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
              {product.category.name}
            </p>
          )}
          <h3 className="font-medium text-foreground line-clamp-2 mb-0.5 sm:mb-1 text-[11px] sm:text-sm leading-tight">
            {product.name}
          </h3>
          
          {/* Rating */}
          {(product.rating ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 mb-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                      i < Math.floor(product.rating ?? 0)
                        ? 'text-accent fill-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] sm:text-[11px] text-muted-foreground">
                ({product.review_count ?? 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs sm:text-base font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
