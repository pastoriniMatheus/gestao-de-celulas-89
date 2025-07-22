
import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Leader {
  id: string;
  name: string;
  photo_url?: string | null;
}

interface CellLeaderInfoProps {
  leader_id: string | null;
  className?: string;
}

export const CellLeaderInfo = ({ leader_id, className = "" }: CellLeaderInfoProps) => {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leader_id) {
      setLeader(null);
      return;
    }

    const fetchLeaderInfo = async () => {
      setLoading(true);
      try {
        console.log('CellLeaderInfo: Buscando informações do líder:', leader_id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .eq('id', leader_id)
          .single();

        if (error) {
          console.error('CellLeaderInfo: Erro ao buscar líder:', error);
          setLeader(null);
          return;
        }

        console.log('CellLeaderInfo: Líder encontrado:', data);
        setLeader(data);
      } catch (error) {
        console.error('CellLeaderInfo: Erro inesperado ao buscar líder:', error);
        setLeader(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderInfo();
  }, [leader_id]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <User className="h-4 w-4" />
        <span className="text-sm">Carregando líder...</span>
      </div>
    );
  }

  if (!leader_id || !leader) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <User className="h-4 w-4" />
        <span className="text-sm">Sem líder definido</span>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className="h-8 w-8 border">
        {leader.photo_url ? (
          <AvatarImage 
            src={leader.photo_url} 
            alt={leader.name}
            className="object-cover"
            onError={(e) => {
              console.error('CellLeaderInfo: Erro ao carregar foto do líder:', leader.photo_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
          {getInitials(leader.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-gray-700">{leader.name}</span>
    </div>
  );
};
