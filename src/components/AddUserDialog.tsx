
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const AddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    canAccessMinistries: false,
    canAccessKids: false,
    activateWithoutConfirmation: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Criando usuário:', formData.email);
      
      // Definir os metadados do usuário
      const userMetadata = {
        name: formData.name,
        role: formData.role,
        email_verified: formData.activateWithoutConfirmation
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('Erro auth:', authError);
        throw authError;
      }

      console.log('Usuário criado no auth:', authData.user?.id);

      if (authData.user) {
        // Se "ativar sem confirmação" estiver marcado, confirmar o email automaticamente
        if (formData.activateWithoutConfirmation) {
          console.log('Confirmando email automaticamente...');
          
          try {
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
              authData.user.id,
              { 
                email_confirm: true,
                user_metadata: {
                  ...userMetadata,
                  email_verified: true
                }
              }
            );

            if (confirmError) {
              console.error('Erro ao confirmar email automaticamente:', confirmError);
            } else {
              console.log('Email confirmado automaticamente');
            }
          } catch (confirmError) {
            console.error('Erro geral na confirmação:', confirmError);
          }
        }

        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            active: true
          }]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          toast({
            title: "Usuário criado",
            description: "Usuário criado no sistema de autenticação, mas houve erro ao criar perfil.",
            variant: "default",
          });
        } else {
          console.log('Perfil criado com sucesso');
          
          // Criar registro de permissões de ministério apenas se o usuário for do tipo "user" e tiver permissões selecionadas
          if (formData.role === 'user' && (formData.canAccessMinistries || formData.canAccessKids)) {
            const { error: accessError } = await supabase
              .from('user_ministry_access')
              .insert([{
                user_id: authData.user.id,
                can_access_ministries: formData.canAccessMinistries,
                can_access_kids: formData.canAccessKids
              }]);

            if (accessError) {
              console.error('Erro ao criar permissões:', accessError);
            }
          }
          
          const successMessage = formData.activateWithoutConfirmation 
            ? "Usuário criado e ativado com sucesso!" 
            : "Usuário criado com sucesso! Um email de confirmação foi enviado.";
          
          toast({
            title: "Sucesso",
            description: successMessage,
          });
        }
      }

      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        role: 'user',
        canAccessMinistries: false,
        canAccessKids: false,
        activateWithoutConfirmation: false
      });
      setIsOpen(false);
      
      // Recarregar a página para atualizar a lista
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      let errorMessage = "Erro ao criar usuário";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Senha inválida";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo do usuário"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirme a senha"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="leader">Líder</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Configurações</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activate-without-confirmation"
                checked={formData.activateWithoutConfirmation}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activateWithoutConfirmation: checked as boolean }))}
              />
              <Label htmlFor="activate-without-confirmation" className="text-sm font-normal">
                Ativar sem confirmação por email
              </Label>
            </div>
          </div>

          {/* Permissões especiais apenas para usuários do tipo "user" */}
          {formData.role === 'user' && (
            <div className="space-y-3">
              <Label>Permissões Especiais</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ministries-access"
                  checked={formData.canAccessMinistries}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canAccessMinistries: checked as boolean }))}
                />
                <Label htmlFor="ministries-access" className="text-sm font-normal">
                  Acesso à sessão Ministérios
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kids-access"
                  checked={formData.canAccessKids}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canAccessKids: checked as boolean }))}
                />
                <Label htmlFor="kids-access" className="text-sm font-normal">
                  Acesso à sessão Ministério Kids e Jovens
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
