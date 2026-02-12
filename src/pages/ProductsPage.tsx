import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';

  const { data: products, isLoading } = useProducts({
    categorySlug: categorySlug || undefined,
    searchQuery: searchQuery || undefined,
  });

  const { data: categories } = useCategories();

const displayProducts = products ?? [];

  // Filter and sort products
  const filteredProducts = displayProducts
    .filter((product) => {
      if (priceRange[0] > 0 || priceRange[1] < 500) {
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }
      }
      if (selectedRatings.length > 0) {
        const productRating = Math.floor(product.rating ?? 0);
        if (!selectedRatings.includes(productRating)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'popular':
          return (b.review_count ?? 0) - (a.review_count ?? 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedRatings([]);
    setSortBy('newest');
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3">Categories</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('category');
              setSearchParams(params);
            }}
            className={`block text-sm ${!categorySlug ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Categories
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('category', cat.slug);
                setSearchParams(params);
              }}
              className={`block text-sm ${categorySlug === cat.slug ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={500}
          step={10}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-semibold mb-3">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedRatings.includes(rating)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRatings([...selectedRatings, rating]);
                  } else {
                    setSelectedRatings(selectedRatings.filter((r) => r !== rating));
                  }
                }}
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rating ? 'text-accent' : 'text-muted'}>
                    ★
                  </span>
                ))}
                <span className="text-sm text-muted-foreground ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            {categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'All Products'}
          </h1>
          {searchQuery && (
            <p className="text-muted-foreground">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 sm:w-44 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(priceRange[0] > 0 || priceRange[1] < 500 || selectedRatings.length > 0 || categorySlug) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categorySlug && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                    {categorySlug}
                    <button onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('category');
                      setSearchParams(params);
                    }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                    ${priceRange[0]} - ${priceRange[1]}
                    <button onClick={() => setPriceRange([0, 500])}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedRatings.map((rating) => (
                  <span key={rating} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                    {rating}+ stars
                    <button onClick={() => setSelectedRatings(selectedRatings.filter((r) => r !== rating))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-secondary rounded-xl mb-4" />
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
