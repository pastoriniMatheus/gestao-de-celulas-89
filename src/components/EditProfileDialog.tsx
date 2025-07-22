
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { userProfile, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (open && userProfile) {
      console.log('EditProfileDialog: Inicializando com perfil:', userProfile);
      setFormData({
        name: userProfile.name || '',
        photo_url: userProfile.photo_url || '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [open, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validar senhas se preenchidas
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        return;
      }

      if (formData.newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('EditProfileDialog: Salvando perfil para usuário:', user.id);
      
      // Atualizar perfil na tabela profiles
      const updateData = {
        name: formData.name.trim(),
        photo_url: formData.photo_url || null,
        updated_at: new Date().toISOString()
      };

      console.log('EditProfileDialog: Dados a serem atualizados:', updateData);

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('EditProfileDialog: Erro ao atualizar perfil:', profileError);
        throw profileError;
      }
      
      console.log('EditProfileDialog: Perfil atualizado com sucesso');

      // Atualizar senha se fornecida
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) {
          console.error('EditProfileDialog: Erro ao atualizar senha:', passwordError);
          throw passwordError;
        }
        
        console.log('EditProfileDialog: Senha atualizada com sucesso');
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      onOpenChange(false);
      
      // Recarregar página após um pequeno delay para atualizar os dados
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('EditProfileDialog: Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar perfil: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log('EditProfileDialog: Fazendo upload da foto...');
      
      // Converter para base64 para armazenar diretamente no banco
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        console.log('EditProfileDialog: Foto carregada como base64');
        setFormData(prev => ({ ...prev, photo_url: imageUrl }));
        
        toast({
          title: "Foto carregada",
          description: "Foto carregada com sucesso. Clique em 'Salvar' para confirmar.",
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('EditProfileDialog: Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    if (formData.name) {
      return formData.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.photo_url} alt={formData.name} />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={() => document.getElementById('photo-input')?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center">
              Clique no ícone da câmera para alterar a foto
            </p>
          </div>

          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Deixe em branco para manter a atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirme a nova senha"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
