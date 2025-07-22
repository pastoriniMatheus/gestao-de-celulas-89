
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange: (photoUrl: string | null) => void;
  contactName: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  contactName
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading photo to bucket "photos" with path:', filePath);

      // Upload to Supabase Storage in the photos bucket
      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      onPhotoChange(publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso!",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (currentPhotoUrl) {
      try {
        // Extract filename from URL to delete from storage
        const urlParts = currentPhotoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName && fileName !== '') {
          const { error } = await supabase.storage
            .from('photos')
            .remove([fileName]);
          
          if (error) {
            console.error('Error deleting photo:', error);
          }
        }
      } catch (error) {
        console.error('Error deleting photo from storage:', error);
      }
    }
    
    onPhotoChange(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={currentPhotoUrl || ''} alt={contactName} />
        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white font-semibold">
          {getInitials(contactName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Upload className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {uploading ? 'Enviando...' : 'Adicionar Foto'}
        </Button>
        
        {currentPhotoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
};
