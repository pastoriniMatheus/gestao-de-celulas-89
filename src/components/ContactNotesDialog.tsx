
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, MessageSquare, Calendar } from 'lucide-react';
import { useContactNotes } from '@/hooks/useContactNotes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContactNotesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  cellId: string;
}

export const ContactNotesDialog = ({ isOpen, onOpenChange, contactId, contactName, cellId }: ContactNotesDialogProps) => {
  const { notes, loading, addNote, deleteNote } = useContactNotes(contactId, cellId);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAdding(true);
    await addNote(newNote);
    setNewNote('');
    setIsAdding(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      await deleteNote(noteId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Anotações - {contactName}
          </DialogTitle>
          <DialogDescription>
            Adicione e visualize anotações sobre este membro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulário para nova anotação */}
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Nova anotação
            </label>
            <Textarea
              id="note"
              placeholder="Digite sua anotação aqui..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || isAdding}
              className="w-full"
            >
              {isAdding ? 'Adicionando...' : 'Adicionar Anotação'}
            </Button>
          </div>

          {/* Lista de anotações */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico de Anotações ({notes.length})
            </h4>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <span className="text-sm text-muted-foreground mt-2">Carregando anotações...</span>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma anotação cadastrada ainda</p>
              </div>
            ) : (
              <ScrollArea className="h-64 border rounded-md p-2">
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-md border">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs">
                          {formatDate(note.created_at)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
