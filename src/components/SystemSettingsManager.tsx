
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

interface SystemConfig {
  site_logo: { url: string; alt: string };
  form_title: { text: string };
  form_description: { text: string };
}

export const SystemSettingsManager = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    site_logo: { url: '', alt: 'Logo da Igreja' },
    form_title: { text: 'Formulário de Contato' },
    form_description: { text: 'Preencha seus dados para nos conectarmos com você' }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('Carregando configurações do sistema...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_logo', 'form_title', 'form_description']);

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações",
          variant: "destructive",
        });
        return;
      }

      console.log('Configurações carregadas:', data);

      if (data && data.length > 0) {
        const settings: any = {};
        data.forEach(item => {
          settings[item.key] = item.value;
        });
        setConfig(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Erro crítico ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Salvar cada configuração
      const updates = [
        { key: 'site_logo', value: config.site_logo },
        { key: 'form_title', value: config.form_title },
        { key: 'form_description', value: config.form_description }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: update.key, 
            value: update.value 
          }, { 
            onConflict: 'key' 
          });

        if (error) {
          console.error(`Erro ao salvar ${update.key}:`, error);
          throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Verificar se é admin por email ou por perfil
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'admin@sistema.com';

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Apenas administradores podem acessar as configurações do sistema.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Configure as opções gerais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo da Igreja */}
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo da Igreja</Label>
            <Input
              id="logo-url"
              type="url"
              value={config.site_logo.url}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                site_logo: { ...prev.site_logo, url: e.target.value }
              }))}
              placeholder="https://exemplo.com/logo.png"
            />
            <p className="text-sm text-gray-500">
              URL da imagem do logo que aparecerá no formulário
            </p>
            {config.site_logo.url && (
              <div className="mt-2">
                <img 
                  src={config.site_logo.url} 
                  alt="Preview do logo"
                  className="h-16 w-auto border rounded"
                />
              </div>
            )}
          </div>

          {/* Título do Formulário */}
          <div className="space-y-2">
            <Label htmlFor="form-title">Título do Formulário</Label>
            <Input
              id="form-title"
              value={config.form_title.text}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                form_title: { text: e.target.value }
              }))}
              placeholder="Formulário de Contato"
            />
          </div>

          {/* Descrição do Formulário */}
          <div className="space-y-2">
            <Label htmlFor="form-description">Descrição do Formulário</Label>
            <Textarea
              id="form-description"
              value={config.form_description.text}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                form_description: { text: e.target.value }
              }))}
              placeholder="Preencha seus dados para nos conectarmos com você"
              rows={3}
            />
          </div>

          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
