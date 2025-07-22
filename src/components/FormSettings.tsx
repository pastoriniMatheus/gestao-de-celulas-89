
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const FormSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFormSettings();
  }, []);

  const loadFormSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('key', ['form_title', 'form_description', 'form_image_url', 'welcome_message', 'success_message']);

      if (error) throw error;

      data?.forEach((setting) => {
        const value = setting.value;
        switch (setting.key) {
          case 'form_title':
            setFormTitle(value && typeof value === 'object' && 'text' in value ? String(value.text) : '');
            break;
          case 'form_description':
            setFormDescription(value && typeof value === 'object' && 'text' in value ? String(value.text) : '');
            break;
          case 'form_image_url':
            setFormImageUrl(value && typeof value === 'object' && 'url' in value ? String(value.url) : '');
            break;
          case 'welcome_message':
            setWelcomeMessage(value && typeof value === 'object' && 'text' in value ? String(value.text) : '');
            break;
          case 'success_message':
            setSuccessMessage(value && typeof value === 'object' && 'text' in value ? String(value.text) : '');
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao carregar configurações do formulário:', error);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // Gerar nome único para a imagem
      const fileExt = file.name.split('.').pop();
      const fileName = `form-image-${Date.now()}.${fileExt}`;
      
      // Upload para o storage do Supabase
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setFormImageUrl(publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      
      uploadImage(file);
    }
  };

  const saveFormSettings = async () => {
    try {
      setLoading(true);

      const configs = [
        { key: 'form_title', value: { text: formTitle } },
        { key: 'form_description', value: { text: formDescription } },
        { key: 'form_image_url', value: { url: formImageUrl } },
        { key: 'welcome_message', value: { text: welcomeMessage } },
        { key: 'success_message', value: { text: successMessage } }
      ];

      for (const config of configs) {
        // Primeiro, tentar atualizar se já existe
        const { data: existingData, error: selectError } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', config.key)
          .single();

        if (existingData) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('system_settings')
            .update({
              value: config.value,
              updated_at: new Date().toISOString()
            })
            .eq('key', config.key);

          if (updateError) throw updateError;
        } else {
          // Inserir novo registro
          const { error: insertError } = await supabase
            .from('system_settings')
            .insert({
              key: config.key,
              value: config.value
            });

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações do formulário salvas!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do formulário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Configurações do Formulário
        </CardTitle>
        <CardDescription>
          Configure as informações exibidas no formulário de cadastro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="form_title">Título do Formulário</Label>
              <Input
                id="form_title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Cadastro de Visitantes"
              />
            </div>

            <div>
              <Label htmlFor="form_description">Descrição</Label>
              <Textarea
                id="form_description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição que aparece no formulário"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="form_image_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagem do Formulário
              </Label>
              <div className="space-y-2">
                <Input
                  id="form_image_url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg ou escolha um arquivo"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingImage ? "Enviando..." : "Escolher Arquivo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Imagem que aparece no cabeçalho do formulário (diferente da logo do sistema)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Mensagem exibida no início do formulário"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="success_message">Mensagem de Sucesso</Label>
              <Textarea
                id="success_message"
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Mensagem exibida após completar o formulário"
                rows={3}
              />
            </div>

            {formImageUrl && (
              <div>
                <Label>Preview da Imagem</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img 
                    src={formImageUrl} 
                    alt="Preview da imagem do formulário"
                    className="max-w-full h-32 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={saveFormSettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  );
};
