
import { Home, Users, Building2, MessageSquare, Settings, Calendar, UserCheck, TreePine, Baby, Heart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

const adminItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    color: "text-blue-600 hover:text-blue-700",
    bgColor: "hover:bg-blue-50",
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
    color: "text-green-600 hover:text-green-700",
    bgColor: "hover:bg-green-50",
  },
  {
    title: "Estágio dos Discípulos",
    url: "/pipeline",
    icon: UserCheck,
    color: "text-purple-600 hover:text-purple-700",
    bgColor: "hover:bg-purple-50",
  },
  {
    title: "Células",
    url: "/cells",
    icon: Building2,
    color: "text-orange-600 hover:text-orange-700",
    bgColor: "hover:bg-orange-50",
  },
  {
    title: "Ministérios",
    url: "/ministries",
    icon: Heart,
    color: "text-rose-600 hover:text-rose-700",
    bgColor: "hover:bg-rose-50",
  },
  {
    title: "Genealogia da Igreja",
    url: "/genealogia",
    icon: TreePine,
    color: "text-emerald-600 hover:text-emerald-700",
    bgColor: "hover:bg-emerald-50",
  },
  {
    title: "Ministério Kids & Jovens",
    url: "/kids",
    icon: Baby,
    color: "text-pink-600 hover:text-pink-700",
    bgColor: "hover:bg-pink-50",
  },
  {
    title: "Mensagens",
    url: "/messages",
    icon: MessageSquare,
    color: "text-indigo-600 hover:text-indigo-700",
    bgColor: "hover:bg-indigo-50",
  },
  {
    title: "Eventos",
    url: "/events",
    icon: Calendar,
    color: "text-red-600 hover:text-red-700",
    bgColor: "hover:bg-red-50",
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    color: "text-teal-600 hover:text-teal-700",
    bgColor: "hover:bg-teal-50",
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    color: "text-gray-600 hover:text-gray-700",
    bgColor: "hover:bg-gray-50",
  },
];

const leaderItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    color: "text-blue-600 hover:text-blue-700",
    bgColor: "hover:bg-blue-50",
  },
  {
    title: "Meus Contatos",
    url: "/contacts",
    icon: Users,
    color: "text-green-600 hover:text-green-700",
    bgColor: "hover:bg-green-50",
  },
  {
    title: "Estágio dos Discípulos",
    url: "/pipeline",
    icon: UserCheck,
    color: "text-purple-600 hover:text-purple-700",
    bgColor: "hover:bg-purple-50",
  },
  {
    title: "Minha Célula",
    url: "/cells",
    icon: Building2,
    color: "text-orange-600 hover:text-orange-700",
    bgColor: "hover:bg-orange-50",
  },
  {
    title: "Ministérios",
    url: "/ministries",
    icon: Heart,
    color: "text-rose-600 hover:text-rose-700",
    bgColor: "hover:bg-rose-50",
  },
  {
    title: "Genealogia da Igreja",
    url: "/genealogia",
    icon: TreePine,
    color: "text-emerald-600 hover:text-emerald-700",
    bgColor: "hover:bg-emerald-50",
  },
  {
    title: "Ministério Kids & Jovens",
    url: "/kids",
    icon: Baby,
    color: "text-pink-600 hover:text-pink-700",
    bgColor: "hover:bg-pink-50",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin, isLeader } = useLeaderPermissions();
  
  const items = isAdmin ? adminItems : (isLeader ? leaderItems : []);

  return (
    <Sidebar className="border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-800 font-semibold text-sm uppercase tracking-wide mb-4">
            Sistema de Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        group relative transition-all duration-200 ease-in-out
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
                          : `${item.bgColor} ${item.color} hover:shadow-sm hover:transform hover:scale-[1.02]`
                        }
                        rounded-lg mx-1 my-0.5 px-3 py-2.5
                      `}
                    >
                      <Link to={item.url} className="flex items-center w-full">
                        <item.icon className={`
                          w-5 h-5 mr-3 transition-transform duration-200
                          ${isActive ? 'text-white' : item.color}
                          group-hover:scale-110
                        `} />
                        <span className={`
                          font-medium text-sm
                          ${isActive ? 'text-white' : 'text-gray-700'}
                          group-hover:font-semibold
                        `}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-75"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Decoração na parte inferior */}
        <div className="mt-auto p-4">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600 text-center font-medium">
              Sistema desenvolvido por
            </p>
            <p className="text-sm font-bold text-blue-700 text-center">
              Matheus Pastorini
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
