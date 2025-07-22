import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Calendar, Eye, Download, ToggleLeft, ToggleRight, Trash2, Edit, Users, Plus } from 'lucide-react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { CreateQRCodeDialog } from './CreateQRCodeDialog';
import { AddEventDialog } from './AddEventDialog';
import { EditEventDialog } from './EditEventDialog';

export const QREventManager = () => {
  const { qrCodes, loading: qrLoading, toggleQRCodeStatus, deleteQRCode } = useQRCodes();
  const { events, loading: eventsLoading, deleteEvent } = useEvents();
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const handleToggleQRStatus = async (id: string, currentStatus: boolean) => {
    await toggleQRCodeStatus(id, !currentStatus);
  };

  const handleDeleteQR = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o QR code "${title}"?`)) {
      await deleteQRCode(id);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${name}"?`)) {
      try {
        await deleteEvent(id);
        toast({
          title: "Sucesso",
          description: "Evento excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir evento.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const activeQRCodes = qrCodes.filter(qr => qr.active).length;
  const totalQRScans = qrCodes.reduce((sum, qr) => sum + qr.scan_count, 0);
  const activeEvents = events.filter(event => event.active).length;
  const totalEventScans = events.reduce((sum, event) => sum + event.scan_count, 0);
  const totalEventRegistrations = events.reduce((sum, event) => sum + (event.registration_count || 0), 0);

  const loading = qrLoading || eventsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Gerenciamento de QR Codes e Eventos
          </CardTitle>
          <CardDescription>
            Crie e gerencie QR codes e eventos em um só lugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">QR Codes Ativos</h3>
              <p className="text-2xl font-bold text-blue-600">{activeQRCodes}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Eventos Ativos</h3>
              <p className="text-2xl font-bold text-green-600">{activeEvents}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Scans QR Codes</h3>
              <p className="text-2xl font-bold text-purple-600">{totalQRScans}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Scans Eventos</h3>
              <p className="text-2xl font-bold text-orange-600">{totalEventScans}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-800">Cadastros Eventos</h3>
              <p className="text-2xl font-bold text-teal-600">{totalEventRegistrations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="qrcodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qrcodes" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes ({qrCodes.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos ({events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qrcodes" className="space-y-4">
          <div className="flex justify-end">
            <CreateQRCodeDialog />
          </div>
          
          {qrCodes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum QR code criado ainda.</p>
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
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{qrCode.scan_count} scans</span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-1 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadQR(qrCode)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleQRStatus(qrCode.id, qrCode.active)}
                      >
                        {qrCode.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteQR(qrCode.id, qrCode.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>
          
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum evento cadastrado ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="truncate">{event.name}</span>
                      </div>
                      <Badge variant={event.active ? "default" : "secondary"}>
                        {event.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Palavra-chave: {event.keyword}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{event.scan_count} scans</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{event.registration_count || 0} cadastros</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddEventDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
      
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
};
