
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Building, 
  MessageSquare, 
  Settings,
  Calendar,
  QrCode,
  GitBranch,
  Baby,
  Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canAccessUserManagement,
    canAccessSettings,
    canAccessEvents,
    canAccessQRCodes,
    canAccessMessaging,
    canAccessContacts,
    canAccessCells,
    canAccessPipeline,
    canAccessMinistries,
    canAccessKids,
    userProfile
  } = useUserPermissions();

  // Log para debug
  console.log('AppSidebar - canAccessKids:', canAccessKids);
  console.log('AppSidebar - userProfile:', userProfile);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/', 
      show: true 
    },
    { 
      icon: Users, 
      label: 'Contatos', 
      path: '/contacts', 
      show: canAccessContacts 
    },
    { 
      icon: Building, 
      label: 'Células', 
      path: '/cells', 
      show: canAccessCells 
    },
    { 
      icon: GitBranch, 
      label: 'Pipeline', 
      path: '/pipeline', 
      show: canAccessPipeline 
    },
    { 
      icon: Building, 
      label: 'Ministérios', 
      path: '/ministries', 
      show: canAccessMinistries 
    },
    { 
      icon: Baby, 
      label: 'Kids', 
      path: '/kids', 
      show: canAccessKids 
    },
    { 
      icon: Bell, 
      label: 'Notificações', 
      path: '/notifications', 
      show: canAccessKids 
    },
    { 
      icon: MessageSquare, 
      label: 'Mensagens', 
      path: '/messages', 
      show: canAccessMessaging 
    },
    { 
      icon: Calendar, 
      label: 'Eventos', 
      path: '/events', 
      show: canAccessEvents 
    },
    { 
      icon: QrCode, 
      label: 'QR Codes', 
      path: '/qr-codes', 
      show: canAccessQRCodes 
    },
    { 
      icon: Users, 
      label: 'Usuários', 
      path: '/users', 
      show: canAccessUserManagement 
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      path: '/settings', 
      show: canAccessSettings 
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Sistema Igreja</h2>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          if (!item.show) return null;
          
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
