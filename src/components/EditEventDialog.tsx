
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  keyword: string;
  qr_code: string;
  qr_url: string;
  scan_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange }: EditEventDialogProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { updateEvent } = useEvents();
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDate(event.date);
      setKeyword(event.keyword);
      setActive(event.active);
    }
  }, [event]);

  const generateQRCode = (keyword: string) => {
    const qrUrl = `${window.location.origin}/qr/${keyword}`;
    return {
      qr_code: `QR-${keyword}-${Date.now()}`,
      qr_url: qrUrl
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !keyword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name,
        date,
        keyword,
        active
      };

      // Se a palavra-chave mudou, gerar novo QR code
      if (keyword !== event.keyword) {
        const { qr_code, qr_url } = generateQRCode(keyword);
        updateData.qr_code = qr_code;
        updateData.qr_url = qr_url;
      }

      await updateEvent(event.id, updateData);

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome do Evento *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Culto de Celebração"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-date">Data do Evento *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-keyword">Palavra-chave *</Label>
            <Input
              id="edit-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toLowerCase())}
              placeholder="Ex: culto2024"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Alterar a palavra-chave gerará um novo QR code
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="edit-active">Evento ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
