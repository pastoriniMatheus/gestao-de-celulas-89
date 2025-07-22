
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { config, loading: configLoading } = useSystemConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        toast({
          title: "Erro ao entrar",
          description: error.message === 'Invalid login credentials' ? "Email ou senha incorretos" : error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    if (signUpData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message === 'User already registered' ? "Este email já está cadastrado" : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode acessar o sistema."
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Usar o logo da tela de login das configurações
  const loginLogoUrl = config.login_logo?.url;
  const logoAlt = config.login_logo?.alt || 'Logo';
  
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-10 bg-gray-800 rounded animate-pulse mb-3"></div>
                <div className="w-40 h-6 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02) 0%, transparent 50%), 
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255,255,255,0.01) 0%, transparent 50%)
        `
      }}></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-6 mb-8">
            {loginLogoUrl && (
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
                <img 
                  src={loginLogoUrl} 
                  alt={logoAlt}
                  className="relative w-20 h-20 object-contain rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/10"
                  onError={(e) => {
                    console.error('Erro ao carregar logo da tela de login:', loginLogoUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                ID do Reino
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-wider uppercase">
                Gestão de Células
              </p>
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="shadow-2xl border-0 bg-white/[0.02] backdrop-blur-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.02] rounded-lg"></div>
          
          <CardHeader className="text-center pb-8 relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-white/60" />
              <CardTitle className="text-2xl text-white font-light tracking-wide">
                Acesso ao Sistema
              </CardTitle>
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>
            
          </CardHeader>
          
          <CardContent className="relative">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 border border-white/10 rounded-lg p-1">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-white border-0 rounded-md transition-all duration-300 data-[state=active]:shadow-lg"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-white border-0 rounded-md transition-all duration-300 data-[state=active]:shadow-lg"
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white text-base font-medium">
                      Email
                    </Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      value={loginData.email} 
                      onChange={e => setLoginData(prev => ({...prev, email: e.target.value}))} 
                      placeholder="seu@email.com" 
                      className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 rounded-lg backdrop-blur-sm" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white text-base font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input 
                        id="login-password" 
                        type={showPassword ? "text" : "password"} 
                        value={loginData.password} 
                        onChange={e => setLoginData(prev => ({...prev, password: e.target.value}))} 
                        placeholder="Sua senha" 
                        className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 pr-12 rounded-lg backdrop-blur-sm" 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black hover:bg-gray-100 font-semibold text-base transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white text-base font-medium">
                      Nome Completo
                    </Label>
                    <Input 
                      id="signup-name" 
                      value={signUpData.name} 
                      onChange={e => setSignUpData(prev => ({...prev, name: e.target.value}))} 
                      placeholder="Seu nome completo" 
                      className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 rounded-lg backdrop-blur-sm" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white text-base font-medium">
                      Email
                    </Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={signUpData.email} 
                      onChange={e => setSignUpData(prev => ({...prev, email: e.target.value}))} 
                      placeholder="seu@email.com" 
                      className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 rounded-lg backdrop-blur-sm" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white text-base font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        value={signUpData.password} 
                        onChange={e => setSignUpData(prev => ({...prev, password: e.target.value}))} 
                        placeholder="Mínimo 6 caracteres" 
                        className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 pr-12 rounded-lg backdrop-blur-sm" 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent text-gray-400 hover:text-white transition-colors" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-white text-base font-medium">
                      Confirmar Senha
                    </Label>
                    <Input 
                      id="signup-confirm-password" 
                      type="password" 
                      value={signUpData.confirmPassword} 
                      onChange={e => setSignUpData(prev => ({...prev, confirmPassword: e.target.value}))} 
                      placeholder="Confirme sua senha" 
                      className="h-12 bg-white/[0.03] border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 rounded-lg backdrop-blur-sm" 
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black hover:bg-gray-100 font-semibold text-base transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ID do Reino. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
