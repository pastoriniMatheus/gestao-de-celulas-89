
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog, Shield, User, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { AddUserDialog } from './AddUserDialog';
import { ErrorBoundary } from './ErrorBoundary';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const UsersManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso!"
      });

      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do usuário",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`
      });

      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    // Confirmação de exclusão
    if (!confirm(`Tem certeza que deseja excluir permanentemente o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingUserId(userId);
    
    try {
      console.log('Excluindo usuário:', { userId, userName });
      
      // Buscar o user_id para excluir também do auth
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Primeiro excluir do profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Erro ao excluir perfil:', profileError);
        throw profileError;
      }

      // Tentar excluir do auth (se tiver user_id)
      if (user.user_id) {
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id);
          if (authError) {
            console.warn('Erro ao excluir usuário do auth (continuando):', authError);
            // Não throw aqui pois o perfil já foi excluído
          }
        } catch (authDeleteError) {
          console.warn('Erro na exclusão do auth (continuando):', authDeleteError);
          // Não interromper o processo
        }
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!"
      });

      // Atualizar lista
      fetchUsers();
      
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: `Erro ao excluir usuário: ${error?.message || "Erro desconhecido"}`,
        variant: "destructive"
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-100 text-red-800',
      leader: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      admin: 'Administrador',
      leader: 'Líder',
      user: 'Usuário'
    };

    return (
      <Badge className={variants[role as keyof typeof variants] || variants.user}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Verificar se o usuário atual tem permissão para gerenciar usuários
  const canManageUsers = userProfile?.role === 'admin';

  if (!canManageUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para gerenciar usuários do sistema.
            Apenas administradores podem acessar esta seção.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter(user => user.active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const leaderUsers = users.filter(user => user.role === 'leader').length;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-blue-600" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>
                  Gerencie usuários, papéis e permissões do sistema
                </CardDescription>
              </div>
              <AddUserDialog />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total de Usuários</h3>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Usuários Ativos</h3>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800">Administradores</h3>
                <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Líderes</h3>
                <p className="text-2xl font-bold text-purple-600">{leaderUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || "user"}
                          onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          disabled={user.user_id === userProfile?.user_id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="leader">Líder</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id, user.active)}
                            disabled={user.user_id === userProfile?.user_id}
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={user.user_id === userProfile?.user_id || deletingUserId === user.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingUserId === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-8">
                <UserCog className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Os usuários aparecerão aqui quando se registrarem no sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};
