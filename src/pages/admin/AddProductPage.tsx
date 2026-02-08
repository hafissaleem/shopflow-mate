import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    stock_quantity: '0',
    is_featured: false,
    is_active: true,
    images: [] as string[],
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          toast({
            title: 'Invalid URL',
            description: 'Image URLs must use HTTP or HTTPS protocol',
            variant: 'destructive',
          });
          return;
        }
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL',
          variant: 'destructive',
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateProduct = () => {
    if (!formData.name || !formData.price || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Slug, Price)',
        variant: 'destructive',
      });
      return false;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast({
        title: 'Validation Error',
        description: 'Slug must contain only lowercase letters, numbers, and hyphens',
        variant: 'destructive',
      });
      return false;
    }
    if (formData.slug.length > 100) {
      toast({
        title: 'Validation Error',
        description: 'Slug must be under 100 characters',
        variant: 'destructive',
      });
      return false;
    }

    // Validate price
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0 || price > 1000000) {
      toast({
        title: 'Validation Error',
        description: 'Price must be between 0 and 1,000,000',
        variant: 'destructive',
      });
      return false;
    }

    // Validate compare_at_price
    if (formData.compare_at_price) {
      const comparePrice = parseFloat(formData.compare_at_price);
      if (isNaN(comparePrice) || comparePrice < 0 || comparePrice > 1000000) {
        toast({
          title: 'Validation Error',
          description: 'Compare-at price must be between 0 and 1,000,000',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Validate stock
    const stock = parseInt(formData.stock_quantity);
    if (isNaN(stock) || stock < 0 || stock > 999999) {
      toast({
        title: 'Validation Error',
        description: 'Stock must be between 0 and 999,999',
        variant: 'destructive',
      });
      return false;
    }

    // Validate description length
    if (formData.description && formData.description.length > 5000) {
      toast({
        title: 'Validation Error',
        description: 'Description must be under 5,000 characters',
        variant: 'destructive',
      });
      return false;
    }

    // Validate name length
    if (formData.name.length > 200) {
      toast({
        title: 'Validation Error',
        description: 'Product name must be under 200 characters',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProduct()) return;

    setLoading(true);

    const { error } = await supabase.from('products').insert([
      {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: formData.images,
      },
    ]);

    setLoading(false);

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product added successfully!',
      });
      navigate('/admin/products');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-display font-bold">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="product-slug"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compare_at_price">Compare at Price</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.compare_at_price}
                onChange={(e) => handleChange('compare_at_price', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => handleChange('stock_quantity', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          
          <div className="flex flex-wrap gap-3">
            {formData.images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">Click the + button to add image URLs</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">Product will be visible to customers</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_featured">Featured</Label>
              <p className="text-sm text-muted-foreground">Show in featured products section</p>
            </div>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleChange('is_featured', checked)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Saving...' : 'Add Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
