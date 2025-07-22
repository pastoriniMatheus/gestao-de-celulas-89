
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Save } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { toast } from '@/hooks/use-toast';

export const AppearanceSettings = () => {
  const { config, updateConfig, loading } = useSystemConfig();
  const [logoUrl, setLogoUrl] = useState('');
  const [logoAlt, setLogoAlt] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [loginLogoUrl, setLoginLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const loginLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setLogoUrl(config.site_logo?.url || '');
      setLogoAlt(config.site_logo?.alt || 'Logo da Igreja');
      setFaviconUrl(config.site_favicon?.url || '');
      setLoginLogoUrl(config.login_logo?.url || '');
    }
  }, [config]);

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'login') => {
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use PNG, JPG, GIF ou SVG.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'logo') {
          setLogoUrl(result);
        } else if (type === 'favicon') {
          setFaviconUrl(result);
        } else if (type === 'login') {
          setLoginLogoUrl(result);
        }
        toast({
          title: "Sucesso",
          description: `${type === 'logo' ? 'Logo' : type === 'favicon' ? 'Favicon' : 'Logo do Login'} carregado! Não esqueça de salvar as configurações.`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    try {
      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // Adicionar novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      link.type = 'image/png';
      document.head.appendChild(link);
      
      // Adicionar também como shortcut icon para melhor compatibilidade
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = faviconUrl;
      shortcutLink.type = 'image/png';
      document.head.appendChild(shortcutLink);
      
      console.log('Favicon atualizado para:', faviconUrl);
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configUpdate: any = {
        site_logo: {
          url: logoUrl,
          alt: logoAlt
        },
        login_logo: {
          url: loginLogoUrl,
          alt: 'Logo do Login'
        }
      };

      // Adicionar favicon se foi definido
      if (faviconUrl) {
        configUpdate.site_favicon = {
          url: faviconUrl
        };
      }

      await updateConfig(configUpdate);

      // Atualizar favicon no navegador
      if (faviconUrl) {
        updateFavicon(faviconUrl);
      }

      toast({
        title: "Sucesso",
        description: "Configurações de aparência salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600" />
          Aparência do Sistema
        </CardTitle>
        <CardDescription>
          Configure o logo, favicon e visual da sua igreja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo da Igreja */}
        <div className="space-y-2">
          <Label>Logo da Igreja</Label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png ou carregue um arquivo"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL da imagem do logo que aparecerá no sistema
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Carregando...' : 'Carregar'}
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
              />
            </div>
          </div>
          {logoUrl && (
            <div className="mt-2">
              <img 
                src={logoUrl} 
                alt="Preview do logo"
                className="h-16 w-auto border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Logo da Tela de Login */}
        <div className="space-y-2">
          <Label>Logo da Tela de Login</Label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Input
                type="url"
                value={loginLogoUrl}
                onChange={(e) => setLoginLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo-login.png ou carregue um arquivo"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL da imagem do logo que aparecerá na tela de login
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => loginLogoInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Carregando...' : 'Carregar'}
              </Button>
              <input
                ref={loginLogoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'login');
                }}
              />
            </div>
          </div>
          {loginLogoUrl && (
            <div className="mt-2">
              <img 
                src={loginLogoUrl} 
                alt="Preview do logo de login"
                className="h-16 w-auto border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Texto Alternativo */}
        <div className="space-y-2">
          <Label htmlFor="logoAlt">Texto Alternativo do Logo</Label>
          <Input
            id="logoAlt"
            value={logoAlt}
            onChange={(e) => setLogoAlt(e.target.value)}
            placeholder="Logo da Igreja"
          />
          <p className="text-sm text-gray-500">
            Texto que aparece quando a imagem não carrega
          </p>
        </div>

        {/* Favicon */}
        <div className="space-y-2">
          <Label>Favicon (Ícone do Navegador)</Label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Input
                type="url"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://exemplo.com/favicon.png ou carregue um arquivo"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ícone que aparece na aba do navegador (recomendado: 32x32 pixels)
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Carregando...' : 'Carregar'}
              </Button>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'favicon');
                }}
              />
            </div>
          </div>
          {faviconUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img 
                src={faviconUrl} 
                alt="Preview do favicon"
                className="h-8 w-8 border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-sm text-gray-600">Preview do favicon</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving || uploading}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações de Aparência'}
        </Button>
      </CardContent>
    </Card>
  );
};
