
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Palette, MapPin, FileText, Webhook, MessageSquare, Database, Users } from 'lucide-react';
import { AppearanceSettings } from './AppearanceSettings';
import { LocationManager } from './LocationManager';
import { FormSettings } from './FormSettings';
import { WebhookManager } from './WebhookManager';
import { MessageTemplateManager } from './MessageTemplateManager';
import { DatabaseSettings } from './DatabaseSettings';
import { MinistriesManager } from './MinistriesManager';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const Settings = () => {
  const { config, loading: configLoading } = useSystemConfig();

  // Usar configurações do sistema para o logo
  const logoUrl = config?.site_logo?.url;
  const logoAlt = config?.site_logo?.alt || 'Logo';
  const churchName = config?.church_name?.text || config?.form_title?.text || 'Sistema de Células';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <SettingsIcon className="h-6 w-6 text-purple-600" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription className="text-base">Configure as preferências e funcionalidades do sistema.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Bairros/Cidades
          </TabsTrigger>
          <TabsTrigger value="ministries" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ministérios
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="locations">
          <LocationManager />
        </TabsContent>

        <TabsContent value="ministries">
          <MinistriesManager />
        </TabsContent>

        <TabsContent value="form">
          <FormSettings />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="messages">
          <MessageTemplateManager />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
