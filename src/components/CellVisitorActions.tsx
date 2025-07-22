
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';

interface CellVisitorActionsProps {
  visitor: any;
  cellId: string;
  onUpdate?: () => void;
}

export const CellVisitorActions = ({ visitor, cellId, onUpdate }: CellVisitorActionsProps) => {
  const { updateContact } = useContacts();
  const { toast } = useToast();

  const handleTurnMember = async () => {
    try {
      await updateContact(visitor.id, {
        status: 'member',
        cell_id: cellId
      });
      
      toast({
        title: "Sucesso",
        description: `${visitor.name} agora é membro da célula!`
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao tornar membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao tornar visitante em membro",
        variant: "destructive"
      });
    }
  };

  // Só mostrar o botão para visitantes
  if (visitor.status !== 'visitor') {
    return null;
  }

  return (
    <Button
      onClick={handleTurnMember}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <UserCheck className="w-4 h-4 mr-2" />
      Tornar Membro
    </Button>
  );
};
