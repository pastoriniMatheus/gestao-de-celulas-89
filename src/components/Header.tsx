import { BirthdayNotifications } from './BirthdayNotifications';
import { MonthlyBirthdaysSection } from './MonthlyBirthdaysSection';
import { UserMenu } from './UserMenu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSystemSettings } from '@/hooks/useSystemSettings';
export const Header = () => {
  const {
    settings,
    loading
  } = useSystemSettings();
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-[16px]">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>
        
        {/* Logo e nome centralizados */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {loading ? <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div> : <div className="flex items-center gap-3">
              {settings.logo_url ? <img src={settings.logo_url} alt="Logo da Igreja" className="w-8 h-8 object-contain rounded border border-gray-200" onError={e => {
            console.error('Erro ao carregar logo no header:', settings.logo_url);
            e.currentTarget.style.display = 'none';
          }} /> : <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(settings.church_name || 'Sistema').charAt(0)}
                  </span>
                </div>}
              <h1 className="text-lg font-semibold text-gray-800">
                {settings.church_name || 'Sistema de Gestão'}
              </h1>
            </div>}
        </div>
        
        <div className="flex items-center gap-2">
          <MonthlyBirthdaysSection />
          <BirthdayNotifications />
          <UserMenu />
        </div>
      </div>
    </header>;
};