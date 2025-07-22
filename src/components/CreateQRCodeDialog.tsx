
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useToast } from '@/hooks/use-toast';

export const CreateQRCodeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    title: ''
  });
  
  const { createQRCode } = useQRCodes();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyword || !formData.title) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createQRCode(formData.keyword, formData.title);
      
      if (result) {
        setFormData({ keyword: '', title: '' });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Erro ao criar QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Criar Novo QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Campanha Natal 2024"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="keyword">Palavra-chave *</Label>
            <Input
              id="keyword"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value.toLowerCase() }))}
              placeholder="Ex: natal2024"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta palavra será usada na URL do QR code (apenas letras, números e hífens)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar QR Code'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
