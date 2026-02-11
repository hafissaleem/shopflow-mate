import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategoryImageUploadProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CategoryImageUpload({ imageUrl, onChange }: CategoryImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Only JPG, PNG, and WebP are allowed.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `categories/${fileName}`;

    const { error } = await supabase.storage.from('product-images').upload(filePath, file);
    if (error) {
      console.error('Category image upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    onChange(urlData.publicUrl);
    toast({ title: 'Uploaded', description: 'Category image uploaded successfully.' });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border group">
          <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">Click to upload image</span>
              <span className="text-xs text-muted-foreground/60">JPG, PNG, WebP · Max 5MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
