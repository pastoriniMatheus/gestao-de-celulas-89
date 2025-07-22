
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const TestLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (testEmail: string, testPassword: string, name: string) => {
    setLoading(true);
    try {
      console.log('Registrando usuário de teste:', testEmail);
      const { error } = await signUp(testEmail, testPassword, name);
      
      if (error) {
        console.error('Erro no registro:', error);
        toast({
          title: "Info",
          description: "Usuário pode já existir. Tente fazer login.",
          variant: "default"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Usuário registrado! Você pode fazer login agora.",
        });
      }
    } catch (error) {
      console.error('Erro crítico no registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestAdmin = () => {
    handleSignUp('admin@sistema.com', '123456', 'Administrador do Sistema');
  };

  const createTestLeader = () => {
    handleSignUp('joao@lider.com', '123456', 'João Silva');
  };

  const loginAsAdmin = () => {
    setEmail('admin@sistema.com');
    setPassword('123456');
  };

  const loginAsLeader = () => {
    setEmail('joao@lider.com');
    setPassword('123456');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sistema de Igreja - Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Criar usuários de teste:</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={createTestAdmin}
              className="flex-1"
              disabled={loading}
            >
              Criar Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={createTestLeader}
              className="flex-1"
              disabled={loading}
            >
              Criar Líder
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 text-center">Logins rápidos:</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loginAsAdmin}
              className="flex-1"
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loginAsLeader}
              className="flex-1"
            >
              Líder
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Senha padrão: 123456
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Instruções:</strong><br/>
            1. Primeiro, clique em "Criar Admin" ou "Criar Líder"<br/>
            2. Depois clique em "Admin" ou "Líder" e faça login<br/>
            3. Use senha: 123456
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
