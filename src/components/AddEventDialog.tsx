
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddEventDialog = ({ open, onOpenChange }: AddEventDialogProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { addEvent } = useEvents();
  const { toast } = useToast();

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
      await addEvent({
        name,
        date,
        keyword,
        active
      });

      // Reset form
      setName('');
      setDate('');
      setKeyword('');
      setActive(true);
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Evento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Culto de Celebração"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="date">Data do Evento *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="keyword">Palavra-chave *</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toLowerCase())}
              placeholder="Ex: culto2024"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta palavra será usada no QR code (será gerado automaticamente)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="active">Evento ativo</Label>
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
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
