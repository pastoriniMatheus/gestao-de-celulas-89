
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { EditProfileDialog } from './EditProfileDialog';

export const UserMenu = () => {
  const { user, userProfile, signOut } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Evitar múltiplos cliques
    
    setIsSigningOut(true);
    try {
      console.log('UserMenu: Iniciando logout...');
      await signOut();
      console.log('UserMenu: Logout realizado com sucesso');
      
      // Forçar reload da página para limpar completamente o estado
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('UserMenu: Erro ao fazer logout:', error);
      setIsSigningOut(false);
      
      // Em caso de erro, tentar forçar limpeza e redirect
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      } catch (clearError) {
        console.error('UserMenu: Erro ao limpar storage:', clearError);
      }
    }
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'leader':
        return 'Líder';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
            <Avatar className="h-10 w-10 border-2 border-gray-200">
              {userProfile?.photo_url ? (
                <AvatarImage 
                  src={userProfile.photo_url} 
                  alt={userProfile?.name || 'User'} 
                  className="object-cover"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem do avatar:', userProfile?.photo_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="text-sm font-semibold bg-blue-100 text-blue-700">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile?.name || 'Usuário'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              {userProfile?.role && (
                <div className="flex items-center gap-1 pt-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {getRoleLabel(userProfile.role)}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};
