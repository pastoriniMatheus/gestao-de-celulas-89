
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Calendar, BookOpen, Users, ClipboardList, BarChart3, Bell, FileText } from 'lucide-react';
import { ChildrenManager } from './kids/ChildrenManager';
import { TeacherSchedule } from './kids/TeacherSchedule';
import { LessonsManager } from './kids/LessonsManager';
import { ClassRecord } from './kids/ClassRecord';
import { ClassHistory } from './kids/ClassHistory';
import { AttendanceChart } from './kids/AttendanceChart';
import { KidsNotificationsManager } from './kids/KidsNotificationsManager';
import { MaterialsManager } from './kids/MaterialsManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export function KidsManager() {
  const [activeTab, setActiveTab] = useState('children');
  const isMobile = useIsMobile();

  const menuItems = [
    { value: 'children', label: 'Kids', icon: Baby, color: 'from-pink-500 to-purple-600' },
    { value: 'schedule', label: 'Escala', icon: Calendar, color: 'from-blue-500 to-indigo-600' },
    { value: 'lessons', label: 'Lições', icon: BookOpen, color: 'from-green-500 to-emerald-600' },
    { value: 'record', label: 'Aula', icon: ClipboardList, color: 'from-orange-500 to-red-600' },
    { value: 'history', label: 'Hist.', icon: Users, color: 'from-purple-500 to-pink-600' },
    { value: 'chart', label: 'Graf.', icon: BarChart3, color: 'from-teal-500 to-cyan-600' },
    { value: 'notifications', label: 'Avisos', icon: Bell, color: 'from-rose-500 to-pink-600' },
    { value: 'materials', label: 'Mat.', icon: FileText, color: 'from-slate-500 to-gray-600' }
  ];

  if (isMobile) {
    return (
      <div className="h-screen w-screen max-w-full fixed inset-100 flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
        {/* Header Fixo com Menu Carrossel */}
        <div className="flex-none bg-white/95 backdrop-blur-lg border-b border-pink-200 shadow-sm">
          {/* Título compacto */}
          <div className="flex items-center justify-center gap-2 py-3 px-3 pt-4">
            <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Baby className="w-2.5 h-2.5 text-white" />
            </div>
            <h1 className="text-m font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
              Kids & Jovens
            </h1>
          </div>
          
        {/* Menu Carrossel Horizontal */}
<div className="relative px-2 pb-3 overflow-hidden">
  {/* Indicador de arraste (seta) */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
    <div className="bg-gradient-to-l from-white to-transparent pl-2 pr-1 py-1 rounded-full shadow-sm">
      <svg
        className="w-4 h-4 text-gray-400 animate-pulse"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>

  <Carousel 
    opts={{
      align: "start",
      dragFree: true,
      containScroll: "trimSnaps",
      slidesToScroll: 1
    }} 
    className="w-full max-w-full"
  >

              <CarouselContent className="-ml-1">
                {menuItems.map((item) => (
                  <CarouselItem key={item.value} className="pl-1 basis-auto">
                    <button
                      onClick={() => setActiveTab(item.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border-1 transition-all duration-300 text-xs whitespace-nowrap w-14 ${
                        activeTab === item.value
                          ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-md`
                          : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-sm hover:border-gray-300'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[12px] font-larg leading-tight truncate text-center">
                        {item.label}
                      </span>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Conteúdo das Subsessões */}
        <div className="flex-1 w-full max-w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full max-w-full">
            <TabsContent value="children" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-pink-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Crianças</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <ChildrenManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-blue-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Escala de Professoras</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <TeacherSchedule />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-green-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Lições</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <LessonsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="record" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-orange-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-orange-500 to-red-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Registro de Aula</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <ClassRecord />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-purple-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Histórico</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <ClassHistory />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-teal-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Gráficos</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden">
                  <AttendanceChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-rose-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Avisos</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <KidsNotificationsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="h-full m-0 w-full max-w-full data-[state=inactive]:hidden">
              <div className="h-full w-full max-w-full bg-white/95 backdrop-blur-sm border-t border-slate-200 flex flex-col overflow-hidden">
                <div className="flex-none bg-gradient-to-r from-slate-500 to-gray-600 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white flex-shrink-0" />
                    <h2 className="text-sm font-bold text-white truncate">Materiais</h2>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden px-3 py-2">
                  <MaterialsManager />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Versão Desktop com layout otimizado
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
      <div className="space-y-4 px-4 py-6 max-w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Ministério Kids & Jovens
            </h1>
          </div>
          <p className="text-sm text-gray-600">Gestão completa do ministério infantojuvenil</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 overflow-hidden">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 bg-white/90 backdrop-blur-sm rounded-xl p-2 w-full shadow-lg border border-pink-100 py-[9px]">
              <TabsTrigger value="children" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                <Baby className="w-4 h-4" />
                <span className="hidden sm:inline">Crianças</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Escala</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Lições</span>
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Registro</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white transition-all duration-300">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Materiais</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-hidden">
            <TabsContent value="children" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-pink-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <Baby className="w-4 h-4" />
                    </div>
                    Cadastro de Crianças
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <ChildrenManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-blue-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    Escala de Professoras
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <TeacherSchedule />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-green-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    Gerenciar Lições
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <LessonsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="record" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-orange-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    Registro de Aula
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <ClassRecord />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    Histórico de Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <ClassHistory />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chart" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-teal-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    Gráfico de Presença
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <AttendanceChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-rose-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <KidsNotificationsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    Materiais de Apoio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-x-hidden">
                  <MaterialsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
