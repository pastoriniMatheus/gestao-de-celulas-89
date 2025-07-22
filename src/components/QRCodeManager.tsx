
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Eye, Download, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useToast } from '@/hooks/use-toast';
import { CreateQRCodeDialog } from './CreateQRCodeDialog';

export const QRCodeManager = () => {
  const { qrCodes, loading, toggleQRCodeStatus, deleteQRCode } = useQRCodes();
  const { toast } = useToast();

  const handleDownloadQR = (qrCode: any) => {
    try {
      const link = document.createElement('a');
      link.href = qrCode.qr_code_data;
      link.download = `qr-${qrCode.keyword}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "QR Code baixado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar QR Code",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleQRCodeStatus(id, !currentStatus);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o QR code "${title}"?`)) {
      await deleteQRCode(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const activeQRCodes = qrCodes.filter(qr => qr.active).length;
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scan_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando QR codes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Gerenciamento de QR Codes
              </CardTitle>
              <CardDescription>
                Crie e gerencie QR codes para campanhas e eventos
              </CardDescription>
            </div>
            <CreateQRCodeDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total de QR Codes</h3>
              <p className="text-2xl font-bold text-blue-600">{qrCodes.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">QR Codes Ativos</h3>
              <p className="text-2xl font-bold text-green-600">{activeQRCodes}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total de Scans</h3>
              <p className="text-2xl font-bold text-purple-600">{totalScans}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum QR code criado ainda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Comece criando seu primeiro QR code!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <span className="truncate">{qrCode.title}</span>
                  </div>
                  <Badge variant={qrCode.active ? "default" : "secondary"}>
                    {qrCode.active ? "Ativo" : "Inativo"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center">
                  <img 
                    src={qrCode.qr_code_data} 
                    alt={`QR Code ${qrCode.title}`}
                    className="w-32 h-32 border rounded"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Palavra-chave: <span className="font-mono">{qrCode.keyword}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    URL: {qrCode.url}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{qrCode.scan_count} scans</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadQR(qrCode)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleStatus(qrCode.id, qrCode.active)}
                  >
                    {qrCode.active ? (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    )}
                    {qrCode.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(qrCode.id, qrCode.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Criado em {formatDate(qrCode.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
