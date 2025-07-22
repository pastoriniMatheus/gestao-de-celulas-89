
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CellsDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('CellsDebug: Testando conexão...');
      
      // Testar conexão básica
      const { data: testData, error: testError } = await supabase
        .from('cells')
        .select('*')
        .limit(5);

      console.log('CellsDebug: Resultado do teste:', { testData, testError });

      // Contar total de células
      const { count, error: countError } = await supabase
        .from('cells')
        .select('*', { count: 'exact', head: true });

      console.log('CellsDebug: Contagem:', { count, countError });

      setDebugInfo({
        testData,
        testError,
        count,
        countError,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('CellsDebug: Erro no teste:', error);
      setDebugInfo({
        error: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Debug - Células</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testConnection} disabled={loading} className="mb-4">
          {loading ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        <div className="space-y-2">
          <div><strong>Total de células:</strong> {debugInfo.count ?? 'N/A'}</div>
          <div><strong>Erro de contagem:</strong> {debugInfo.countError?.message ?? 'Nenhum'}</div>
          <div><strong>Erro de teste:</strong> {debugInfo.testError?.message ?? 'Nenhum'}</div>
          <div><strong>Última atualização:</strong> {debugInfo.timestamp ?? 'N/A'}</div>
        </div>
        
        {debugInfo.testData && (
          <div className="mt-4">
            <strong>Dados de teste:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo.testData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
