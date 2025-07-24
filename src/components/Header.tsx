
import { UserMenu } from './UserMenu';
import { SidebarTrigger } from './ui/sidebar';
import { BirthdayNotifications } from './BirthdayNotifications';
import { MonthlyBirthdaysSection } from './MonthlyBirthdaysSection';
import { NewContactNotifications } from './NewContactNotifications';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">ID do Reino</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <NewContactNotifications />
          <BirthdayNotifications />
          <MonthlyBirthdaysSection />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
