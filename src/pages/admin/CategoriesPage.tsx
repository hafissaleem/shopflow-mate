import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setLoading(false);
    if (error) {
      console.error("Error fetching categories:", error.message);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
      return;
    }
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleAddCategory = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
    
    setIsAdding(true);
    const slug = generateSlug(name);
    const { error } = await supabase
      .from("categories")
      .insert([{ name: name.trim(), slug }]);
    setIsAdding(false);
    
    if (error) {
      console.error("Error adding category:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: `Category "${name}" added successfully`,
    });
    setName("");
    fetchCategories();
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Error deleting category:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Deleted",
      description: `Category "${categoryName}" has been deleted`,
    });
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Categories</h1>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Add Category Form */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Category name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button
              className="btn-accent gap-2"
              onClick={handleAddCategory}
              disabled={isAdding || !name.trim()}
            >
              <Plus className="h-4 w-4" />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>

        {/* Category List */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No categories yet. Add your first category above.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
