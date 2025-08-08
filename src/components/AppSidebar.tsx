
import { Home, Users, Settings, MessageSquare, Calendar, QrCode, UserCog, Building, Baby, Network } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";

export const AppSidebar = () => {
  const location = useLocation();
  const { 
    canAccessUserManagement, 
    canAccessSettings, 
    canAccessEvents, 
    canAccessQRCodes, 
    canAccessMessaging,
    canAccessContacts,
    canAccessDashboard,
    canAccessCells,
    canAccessPipeline,
    canAccessMinistries,
    canAccessKids,
    canAccessGenealogy // Sempre será false
  } = useUserPermissions();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      show: canAccessDashboard
    },
    {
      title: "Contatos",
      icon: Users,
      href: "/contacts",
      show: canAccessContacts
    },
    {
      title: "Células",
      icon: Building,
      href: "/cells",
      show: canAccessCells
    },
    {
      title: "Pipeline",
      icon: Users,
      href: "/pipeline",
      show: canAccessPipeline
    },
    {
      title: "Ministérios",
      icon: Building,
      href: "/ministries",
      show: canAccessMinistries
    },
    {
      title: "Kids",
      icon: Baby,
      href: "/kids",
      show: canAccessKids
    },
    // REMOVER completamente a opção de Genealogia
    // {
    //   title: "Genealogia",
    //   icon: Network,
    //   href: "/genealogy",
    //   show: canAccessGenealogy
    // },
    {
      title: "Mensagens",
      icon: MessageSquare,
      href: "/messages",
      show: canAccessMessaging
    },
    {
      title: "Eventos",
      icon: Calendar,
      href: "/events",
      show: canAccessEvents
    },
    {
      title: "QR Codes",
      icon: QrCode,
      href: "/qr-codes",
      show: canAccessQRCodes
    },
    {
      title: "Usuários",
      icon: UserCog,
      href: "/users",
      show: canAccessUserManagement
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/settings",
      show: canAccessSettings
    }
  ];

  // Filtrar apenas os itens que o usuário pode ver
  const visibleMenuItems = menuItems.filter(item => item.show);

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Sistema Igreja</h2>
      </div>
      
      <nav className="mt-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors",
                isActive && "bg-blue-100 text-blue-700 border-r-4 border-blue-700"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
