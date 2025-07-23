import {
  Home,
  Users,
  Calendar,
  Settings,
  UserPlus,
  Qrcode,
  MessageSquare,
  LayoutDashboard,
  Baby,
  GitFork,
  LucideIcon,
  BadgeInfo,
  ListChecks
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  badge?: string;
}

export const AppSidebar = () => {
  const location = useLocation();
  const { 
    isAdmin, 
    canAccessSettings, 
    canAccessEvents, 
    canAccessQRCodes, 
    canAccessMessaging,
    canAccessMinistriesPage,
    canAccessKidsPage 
  } = useUserPermissions();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      isActive: location.pathname === "/"
    },
    {
      title: "Contatos",
      icon: Users,
      href: "/contacts",
      isActive: location.pathname === "/contacts"
    },
    {
      title: "Células",
      icon: Home,
      href: "/cells",
      isActive: location.pathname === "/cells"
    },
    {
      title: "Pipeline",
      icon: GitFork,
      href: "/pipeline",
      isActive: location.pathname === "/pipeline"
    },
    ...(canAccessMessaging ? [{
      title: "Mensagens",
      icon: MessageSquare,
      href: "/messages",
      isActive: location.pathname === "/messages"
    }] : []),
    ...(canAccessMinistriesPage ? [{
      title: "Ministérios",
      icon: Users,
      href: "/ministries",
      isActive: location.pathname === "/ministries"
    }] : []),
    ...(canAccessKidsPage ? [{
      title: "Ministério Infantil",
      icon: Baby,
      href: "/kids",
      isActive: location.pathname === "/kids"
    }] : []),
    ...(canAccessEvents ? [{
      title: "Eventos",
      icon: Calendar,
      href: "/events",
      isActive: location.pathname === "/events"
    }] : []),
    ...(canAccessQRCodes ? [{
      title: "QR Codes",
      icon: Qrcode,
      href: "/qrcodes",
      isActive: location.pathname === "/qrcodes"
    }] : []),
    ...(isAdmin ? [{
      title: "Usuários",
      icon: UserPlus,
      href: "/users",
      isActive: location.pathname === "/users"
    }] : []),
    ...(canAccessSettings ? [{
      title: "Configurações",
      icon: Settings,
      href: "/settings",
      isActive: location.pathname === "/settings"
    }] : []),
  ];

  const navigate = useNavigate();

  useEffect(() => {
    // Atualiza o título da página com base no item de menu ativo
    const activeItem = menuItems.find(item => item.isActive);
    if (activeItem) {
      document.title = `IDP - ${activeItem.title}`;
    }
  }, [location, menuItems]);

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <h1 className="text-lg font-bold">IDP</h1>
        <p className="text-sm text-gray-500">Painel Administrativo</p>
      </div>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.title}>
            <a
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 transition-colors ${item.isActive ? 'bg-gray-100 font-medium' : 'text-gray-600'
                }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.title}
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto px-4">
        <a
          href="https://github.com/felipemarinho98/igreja-digital-platform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <BadgeInfo className="h-4 w-4 mr-2" />
          Sobre
        </a>
      </div>
    </div>
  );
};
