import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Save, Download, Upload, TestTube, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface DatabaseConfig {
  project_url: string;
  anon_key: string;
  service_role_key: string;
  project_id: string;
  database_url: string;
  [key: string]: string;
}

const BACKUP_TABLES = [
  'contacts', 'cells', 'profiles', 'cities', 'neighborhoods', 
  'pipeline_stages', 'events', 'qr_codes', 'message_templates',
  'webhook_configs', 'system_settings', 'attendances', 'birthday_notifications',
  'birthday_webhooks', 'contact_notes', 'qr_scans', 'referral_channels',
  'sent_messages'
] as const;

type BackupTableName = typeof BACKUP_TABLES[number];

export const DatabaseSettings = () => {
  const { config, updateConfig } = useSystemConfig();
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    project_url: 'https://paaffmonmovorgyantux.supabase.co',
    anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYWZmbW9ubW92b3JneWFudHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODI4MDcsImV4cCI6MjA2NTQ1ODgwN30.FfBjzdWg4g6T5sAP81iQaQsPad95T91g9uv9A_F6wiY',
    service_role_key: '',
    project_id: 'paaffmonmovorgyantux',
    database_url: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Carregar configurações salvas do sistema
    if (config.database_config) {
      console.log('DatabaseSettings: Carregando configurações do banco:', config.database_config);
      setDbConfig(prev => ({ ...prev, ...config.database_config }));
    }
  }, [config]);

  const testConnection = async () => {
    console.log('DatabaseSettings: Testando conexão com dados:', dbConfig);
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      // Verificar se os campos obrigatórios estão preenchidos
      if (!dbConfig.project_url || !dbConfig.anon_key) {
        throw new Error('URL do projeto e chave anônima são obrigatórios');
      }

      // Testar conexão básica com o Supabase usando uma consulta simples
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .limit(1);

      console.log('DatabaseSettings: Resultado do teste de conexão:', { data, error });

      if (error) {
        console.error('DatabaseSettings: Erro na conexão:', error);
        throw new Error(`Erro de conexão: ${error.message}`);
      }

      setConnectionStatus('success');
      toast({
        title: "Sucesso",
        description: "Conexão com o banco de dados testada com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error: any) {
      console.error('DatabaseSettings: Erro ao testar conexão:', error);
      setConnectionStatus('error');
      setErrorMessage(error.message);
      toast({
        title: "Erro",
        description: `Falha ao conectar: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      console.log('DatabaseSettings: Salvando configurações do banco:', dbConfig);
      
      await updateConfig({
        database_config: dbConfig
      });

      toast({
        title: "Sucesso",
        description: "Configurações do banco salvas com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('DatabaseSettings: Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do banco",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadDatabase = async () => {
    setDownloading(true);
    try {
      console.log('DatabaseSettings: Iniciando dump completo do banco...');
      
      const backup: any = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        system: 'Sistema Matheus Pastorini - Dump Completo',
        database_info: {
          project_url: dbConfig.project_url,
          project_id: dbConfig.project_id,
          exported_at: new Date().toISOString()
        },
        data: {},
        metadata: {
          total_tables: 0,
          total_records: 0,
          export_duration: 0
        }
      };

      const startTime = Date.now();
      let totalRecords = 0;

      // Exportar dados de cada tabela usando type-safe approach
      for (const tableName of BACKUP_TABLES) {
        try {
          console.log(`DatabaseSettings: Exportando tabela ${tableName}...`);
          
          const { data, error, count } = await supabase
            .from(tableName as BackupTableName)
            .select('*', { count: 'exact' });

          if (!error && data) {
            backup.data[tableName] = {
              records: data,
              count: data.length,
              exported_at: new Date().toISOString()
            };
            totalRecords += data.length;
            console.log(`DatabaseSettings: Exportados ${data.length} registros da tabela ${tableName}`);
          } else if (error) {
            console.warn(`DatabaseSettings: Erro ao exportar tabela ${tableName}:`, error);
            backup.data[tableName] = {
              records: [],
              count: 0,
              error: error.message,
              exported_at: new Date().toISOString()
            };
          }
        } catch (error) {
          console.warn(`DatabaseSettings: Erro ao processar tabela ${tableName}:`, error);
          backup.data[tableName] = {
            records: [],
            count: 0,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            exported_at: new Date().toISOString()
          };
        }
      }

      const endTime = Date.now();
      backup.metadata = {
        total_tables: BACKUP_TABLES.length,
        total_records: totalRecords,
        export_duration: endTime - startTime
      };

      // Baixar arquivo JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dump-completo-${dbConfig.project_id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: `Dump completo baixado! ${totalRecords} registros de ${BACKUP_TABLES.length} tabelas - Sistema Matheus Pastorini`
      });
    } catch (error) {
      console.error('DatabaseSettings: Erro ao fazer dump completo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer dump completo do banco de dados",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const uploadDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log('DatabaseSettings: Iniciando restauração do backup...');
      
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Formato de backup inválido');
      }

      let restoredTables = 0;
      let totalRecords = 0;

      // Verificar se é um dump completo (v2.0) ou backup simples (v1.0)
      const isFullDump = backup.version === '2.0';

      // Restaurar dados para cada tabela usando type-safe approach
      for (const tableName of BACKUP_TABLES) {
        const tableData = backup.data[tableName];
        
        // Para dump completo, os dados estão em tableData.records
        // Para backup simples, os dados estão diretamente em tableData
        const records = isFullDump ? tableData?.records : tableData;
        
        if (Array.isArray(records) && records.length > 0) {
          try {
            console.log(`DatabaseSettings: Restaurando tabela ${tableName} com ${records.length} registros...`);
            
            // Primeiro, limpar dados existentes (cuidado!)
            const { error: deleteError } = await supabase
              .from(tableName as BackupTableName)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
              console.warn(`DatabaseSettings: Aviso ao limpar tabela ${tableName}:`, deleteError);
            }

            // Inserir novos dados em lotes para evitar timeout
            const batchSize = 100;
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize);
              const { error: insertError } = await supabase
                .from(tableName as BackupTableName)
                .insert(batch);

              if (insertError) {
                console.error(`DatabaseSettings: Erro ao restaurar lote da tabela ${tableName}:`, insertError);
                throw insertError;
              }
            }

            restoredTables++;
            totalRecords += records.length;
            console.log(`DatabaseSettings: Restaurados ${records.length} registros na tabela ${tableName}`);
          } catch (error) {
            console.error(`DatabaseSettings: Erro ao processar tabela ${tableName}:`, error);
            throw error;
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `${isFullDump ? 'Dump completo' : 'Backup'} restaurado! ${restoredTables} tabelas e ${totalRecords} registros - Sistema Matheus Pastorini`
      });
    } catch (error) {
      console.error('DatabaseSettings: Erro ao restaurar backup:', error);
      toast({
        title: "Erro",
        description: "Erro ao restaurar backup do banco de dados",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testando...';
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Não testado';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Configurações do Banco de Dados
        </CardTitle>
        <CardDescription>
          Configure a conexão com o Supabase e gerencie backups do banco de dados - Sistema Matheus Pastorini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Status da Conexão:</span>
            <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {getStatusText()}
            </Badge>
          </div>
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing'}
            variant="outline"
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Testar Conexão
          </Button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Configurações de Conexão */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Conexão</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-url">URL do Projeto *</Label>
              <Input
                id="project-url"
                value={dbConfig.project_url}
                onChange={(e) => setDbConfig(prev => ({ ...prev, project_url: e.target.value }))}
                placeholder="https://xxx.supabase.co"
                required
              />
            </div>

            <div>
              <Label htmlFor="project-id">ID do Projeto</Label>
              <Input
                id="project-id"
                value={dbConfig.project_id}
                onChange={(e) => setDbConfig(prev => ({ ...prev, project_id: e.target.value }))}
                placeholder="projeto-id"
              />
            </div>

            <div>
              <Label htmlFor="anon-key">Chave Anônima *</Label>
              <Input
                id="anon-key"
                type="password"
                value={dbConfig.anon_key}
                onChange={(e) => setDbConfig(prev => ({ ...prev, anon_key: e.target.value }))}
                placeholder="eyJ..."
                required
              />
            </div>

            <div>
              <Label htmlFor="service-key">Chave de Serviço (Opcional)</Label>
              <Input
                id="service-key"
                type="password"
                value={dbConfig.service_role_key}
                onChange={(e) => setDbConfig(prev => ({ ...prev, service_role_key: e.target.value }))}
                placeholder="eyJ..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="database-url">URL do Banco (Opcional)</Label>
              <Input
                id="database-url"
                value={dbConfig.database_url}
                onChange={(e) => setDbConfig(prev => ({ ...prev, database_url: e.target.value }))}
                placeholder="postgresql://..."
              />
            </div>
          </div>

          <Button 
            onClick={saveConfiguration} 
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <Separator />

        {/* Backup e Restauração */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Backup e Restauração</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Dump Completo</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Baixa todas as tabelas do banco com metadados detalhados
                </p>
                <Button 
                  onClick={downloadDatabase} 
                  disabled={downloading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Baixando...' : 'Baixar Dump Completo'}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Restaurar Backup</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Carrega dados de um arquivo de backup ou dump
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={uploadDatabase}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button 
                    disabled={uploading}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Carregando...' : 'Carregar Backup'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>
              <strong>Atenção:</strong> O dump completo inclui todas as tabelas com metadados. Restaurar um backup irá substituir todos os dados atuais do banco de dados.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
