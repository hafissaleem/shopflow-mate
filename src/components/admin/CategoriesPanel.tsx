import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import CategoryImageUpload from "./CategoryImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Pencil, Search, FolderOpen, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  is_active: boolean;
  image_url: string | null;
}

const initialFormData: CategoryFormData = {
  name: "",
  description: "",
  is_active: true,
  image_url: null,
};

interface CategoriesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoriesPanel({ open, onOpenChange }: CategoriesPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});
  
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setLoading(false);
    
    if (error) {
      if (import.meta.env.DEV) console.error("Error fetching categories:", error.message);
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
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Filter categories based on search and status
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && cat.is_active) ||
        (statusFilter === "inactive" && !cat.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
      image_url: category.image_url,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    const slug = generateSlug(formData.name);
    
    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: formData.name.trim(),
          slug,
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          image_url: formData.image_url,
        })
        .eq("id", editingCategory.id);
      
      setSaving(false);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update category. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Category "${formData.name}" updated successfully`,
      });
    } else {
      const { error } = await supabase
        .from("categories")
        .insert([{
          name: formData.name.trim(),
          slug,
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          image_url: formData.image_url,
        }]);
      
      setSaving(false);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to add category. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Category "${formData.name}" added successfully`,
      });
    }
    
    setIsFormOpen(false);
    fetchCategories();
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deletingCategory.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    toast({
      title: "Deleted",
      description: `Category "${deletingCategory.name}" has been deleted`,
    });
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
    fetchCategories();
  };

  const handleToggleStatus = async (category: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Updated",
      description: `Category "${category.name}" is now ${!category.is_active ? "active" : "inactive"}`,
    });
    fetchCategories();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 pb-4 border-b border-border">
              <div className="flex items-center justify-between pr-8">
                <SheetTitle className="text-xl font-display">Categories</SheetTitle>
                <Button onClick={handleOpenAddDialog} size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Filter */}
              <div className="mt-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SheetHeader>

            {/* Categories List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
                    Loading...
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-12 text-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "No categories match your search"
                        : "No categories yet"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button onClick={handleOpenAddDialog} variant="link" size="sm" className="mt-2">
                        Add your first category
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="group p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Category Thumbnail */}
                        <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <FolderOpen className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{category.name}</h4>
                            <Badge
                              variant={category.is_active ? "default" : "secondary"}
                              className="shrink-0 text-xs cursor-pointer"
                              onClick={() => handleToggleStatus(category)}
                            >
                              {category.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">/{category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditDialog(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDeleteDialog(category)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {!loading && filteredCategories.length > 0 && (
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {filteredCategories.length} of {categories.length} categories
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Fill in the details to create a new category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Image */}
            <div className="space-y-2">
              <Label>Category Image</Label>
              <CategoryImageUpload
                imageUrl={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Mountain Bikes"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className={formErrors.description ? "border-destructive" : ""}
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">{formErrors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive categories won't appear in the store
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
