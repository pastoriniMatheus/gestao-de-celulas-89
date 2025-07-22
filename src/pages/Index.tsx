
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { EventsManager } from '@/components/EventsManager';
import { ContactsManager } from '@/components/ContactsManager';
import { CellsManager } from '@/components/CellsManager';
import { Pipeline } from '@/components/Pipeline';
import { Settings } from '@/components/Settings';
import { UsersManager } from '@/components/UsersManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Mapear as rotas para as seções
  const pathToSection: {
    [key: string]: string;
  } = {
    '/': 'dashboard',
    '/contacts': 'contacts',
    '/cells': 'cells',
    '/pipeline': 'pipeline',
    '/events': 'events',
    '/settings': 'settings',
    '/users': 'users'
  };

  // Atualizar a seção ativa baseada na URL
  useEffect(() => {
    const section = pathToSection[location.pathname] || 'dashboard';
    setActiveSection(section);
    console.log('Seção ativa:', section, 'URL atual:', location.pathname);
  }, [location.pathname]);

  const renderContent = () => {
    console.log('Renderizando conteúdo para seção:', activeSection);
    
    try {
      switch (activeSection) {
        case 'dashboard':
          return (
            <ErrorBoundary key="dashboard">
              <Dashboard />
            </ErrorBoundary>
          );
        case 'events':
          return (
            <ErrorBoundary key="events">
              <EventsManager />
            </ErrorBoundary>
          );
        case 'contacts':
          return (
            <ErrorBoundary key="contacts">
              <ContactsManager />
            </ErrorBoundary>
          );
        case 'cells':
          return (
            <ErrorBoundary key="cells">
              <CellsManager />
            </ErrorBoundary>
          );
        case 'pipeline':
          return (
            <ErrorBoundary key="pipeline">
              <Pipeline />
            </ErrorBoundary>
          );
        case 'settings':
          return (
            <ErrorBoundary key="settings">
              <Settings />
            </ErrorBoundary>
          );
        case 'users':
          return (
            <ErrorBoundary key="users">
              <UsersManager />
            </ErrorBoundary>
          );
        default:
          console.log('Seção não encontrada, retornando Dashboard');
          return (
            <ErrorBoundary key="default-dashboard">
              <Dashboard />
            </ErrorBoundary>
          );
      }
    } catch (error) {
      console.error('Erro ao renderizar conteúdo:', error);
      return (
        <ErrorBoundary key="error-fallback">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro ao carregar seção</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </ErrorBoundary>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
