
import React from 'react';
import { GenealogyNetwork } from '@/components/GenealogyNetwork';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Users, TreePine, Target, Triangle, UserPlus, ArrowLeft } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { useNavigate } from 'react-router-dom';

const GenealogyPage = () => {
  const { contacts } = useContacts();
  const { cells } = useCells();
  const navigate = useNavigate();

  // Calcular estatísticas da rede de discipulado
  const connectedMembers = contacts.filter(c => c.referred_by || contacts.some(other => other.referred_by === c.id));
  const standbyMembers = contacts.filter(c => !c.referred_by && !contacts.some(other => other.referred_by === c.id));
  
  const totalMembers = contacts.length;
  const connectionRate = totalMembers > 0 ? Math.round((connectedMembers.length / totalMembers) * 100) : 0;
  
  const maxDepth = Math.max(
    ...contacts.map(contact => {
      let depth = 0;
      let current = contact;
      const visited = new Set();
      
      while (current.referred_by && !visited.has(current.id)) {
        visited.add(current.id);
        current = contacts.find(c => c.id === current.referred_by) || current;
        depth++;
        if (depth > 10) break;
      }
      
      return depth;
    }),
    0
  );

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
              <Triangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Rede de Discipulado
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize a estrutura hierárquica de discipulado da igreja. 
            Explore as conexões por indicação e por liderança, acompanhe o crescimento da rede.
          </p>
        </div>

        {/* Estatísticas da Rede */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Na base de dados
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conectados</CardTitle>
              <Network className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{connectedMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                Na rede de discipulado ({connectionRate}%)
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profundidade Máxima</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{maxDepth + 1}</div>
              <p className="text-xs text-muted-foreground">
                Níveis de discipulado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Standby</CardTitle>
              <UserPlus className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{standbyMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando conexão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rede de Discipulado Interativa */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Triangle className="w-5 h-5 text-purple-600" />
              Rede de Discipulado
            </CardTitle>
            <CardDescription>
              Explore a estrutura hierárquica por indicação e liderança. Use os controles para navegar pelos níveis 
              e expandir as conexões. Membros em standby aparecem no painel lateral.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <GenealogyNetwork />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenealogyPage;
