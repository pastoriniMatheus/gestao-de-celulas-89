import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  QrCode, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  UserCog,
  MapPin,
  TrendingUp,
  Contact,
  TreePine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSystemConfig } from '@/hooks/useSystemConfig';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUserPermissions();
  const { config, loading: configLoading } = useSystemConfig();

  console.log('Sidebar - permissions recebidas:', permissions);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      description: 'Visão geral do sistema',
      path: '/', 
      show: permissions.canAccessDashboard 
    },
    { 
      icon: Calendar, 
      label: 'Eventos & QR Codes', 
      description: 'Gerenciar eventos e QR codes',
      path: '/events', 
      show: permissions.canAccessEvents 
    },
    { 
      icon: Contact, 
      label: 'Discípulos', 
      description: 'Visitantes e membros',
      path: '/contacts', 
      show: permissions.canAccessContacts 
    },
    { 
      icon: Users, 
      label: 'Células', 
      description: 'Células domiciliares',
      path: '/cells', 
      show: permissions.canAccessCells 
    },
    { 
      icon: TreePine, 
      label: 'Genealogia da Igreja', 
      description: 'Rede de discipulado',
      path: '/genealogia', 
      show: permissions.canAccessDashboard 
    },
    { 
      icon: MessageSquare, 
      label: 'Mensagens', 
      description: 'Central de mensagens',
      path: '/messaging', 
      show: permissions.canAccessMessaging 
    },
    { 
      icon: TrendingUp, 
      label: 'Estágio dos Discípulos', 
      description: 'Pipeline de conversão',
      path: '/pipeline', 
      show: permissions.canAccessPipeline 
    },
    { 
      icon: UserCog, 
      label: 'Usuários', 
      description: 'Gerenciar usuários',
      path: '/users', 
      show: permissions.canAccessUserManagement 
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      description: 'Configurações do sistema',
      path: '/settings', 
      show: permissions.canAccessSettings 
    },
  ];

  console.log('Sidebar - todos os menuItems antes do filtro:', menuItems);
  
  const filteredMenuItems = menuItems.filter(item => item.show);
  
  console.log('Sidebar - menuItems após filtro:', filteredMenuItems);
  console.log('Sidebar - quantidade de itens visíveis:', filteredMenuItems.length);

  const handleMenuClick = (path: string) => {
    console.log('Navegando para:', path);
    navigate(path);
  };

  // Usar configurações do sistema para o logo
  const logoUrl = config?.site_logo?.url;
  const logoAlt = config?.site_logo?.alt || 'Logo';
  const churchName = config?.church_name?.text || config?.form_title?.text || 'Sistema de Células';

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              {configLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={logoAlt}
                  className="w-8 h-8 object-contain rounded border border-gray-200"
                  onError={(e) => {
                    console.error('Erro ao carregar logo no sidebar:', logoUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Logo carregado com sucesso no sidebar:', logoUrl);
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {churchName.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-800">Gestão Celular</h1>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              {configLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={logoAlt}
                  className="w-8 h-8 object-contain rounded border border-gray-200"
                  onError={(e) => {
                    console.error('Erro ao carregar logo no sidebar:', logoUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {churchName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          console.log('Renderizando item do menu:', item.label, 'show:', item.show);
          
          return (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors text-left group",
                isActive 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed ? "justify-center py-2" : "flex-col items-start"
              )}
            >
              <div className={cn(
                "flex items-center gap-3 w-full",
                isCollapsed && "justify-center"
              )}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <span className="text-xs text-gray-500 mt-1 ml-8">
                  {item.description}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {permissions.userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "text-xs text-gray-500",
            isCollapsed && "text-center"
          )}>
            {!isCollapsed && (
              <>
                <div className="font-medium">{permissions.userProfile.name}</div>
                <div className="capitalize">{permissions.userProfile.role}</div>
              </>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {permissions.userProfile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
