
import { Users, MapPin, Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContactAvatar } from './ContactAvatar';

interface CellDetailsProps {
  cell: any;
}

export const CellDetails = ({ cell }: CellDetailsProps) => {
  const getDayName = (dayNumber: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNumber] || 'Não definido';
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Não definido';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Separar membros e visitantes
  const members = cell.contacts?.filter((contact: any) => contact.status === 'member') || [];
  const visitors = cell.contacts?.filter((contact: any) => contact.status === 'visitor') || [];

  return (
    <div className="space-y-6">
      {/* Informações da Célula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Endereço:</span>
          <span className="text-sm font-medium">{cell.address}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Dia:</span>
          <span className="text-sm font-medium">{getDayName(cell.meeting_day)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Horário:</span>
          <span className="text-sm font-medium">{formatTime(cell.meeting_time)}</span>
        </div>
        
        {cell.leader && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Líder:</span>
            <span className="text-sm font-medium">{cell.leader.name}</span>
          </div>
        )}
      </div>

      {/* Lista de Membros */}
      {members.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-700">
              Membros ({members.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {members.map((contact: any) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <ContactAvatar 
                    name={contact.name}
                    photoUrl={contact.photo_url}
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-green-800">{contact.name}</p>
                    <p className="text-sm text-green-600">{contact.whatsapp}</p>
                    {contact.attendance_code && (
                      <p className="text-xs text-green-700 font-mono bg-green-100 px-2 py-1 rounded mt-1">
                        Código: {contact.attendance_code}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {contact.encounter_with_god && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      Encontro
                    </Badge>
                  )}
                  {contact.baptized && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                      Batizado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Visitantes */}
      {visitors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-700">
              Visitantes ({visitors.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {visitors.map((contact: any) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <ContactAvatar 
                    name={contact.name}
                    photoUrl={contact.photo_url}
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-blue-800">{contact.name}</p>
                    <p className="text-sm text-blue-600">{contact.whatsapp}</p>
                    {contact.attendance_code && (
                      <p className="text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded mt-1">
                        Código: {contact.attendance_code}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {contact.encounter_with_god && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      Encontro
                    </Badge>
                  )}
                  {contact.baptized && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                      Batizado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há contatos */}
      {(!cell.contacts || cell.contacts.length === 0) && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum membro cadastrado nesta célula ainda.</p>
        </div>
      )}
    </div>
  );
};
