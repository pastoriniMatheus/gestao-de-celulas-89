
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cake, Phone, Gift, Calendar } from 'lucide-react';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';

export const BirthdayNotifications = () => {
  const { todayBirthdays, loading } = useBirthdayNotifications();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-600" />
            Aniversariantes de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todayBirthdays.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-600" />
            Aniversariantes de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">
              Nenhum aniversariante hoje
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-pink-600" />
          Aniversariantes de Hoje
          <Badge variant="secondary" className="ml-2">
            {todayBirthdays.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayBirthdays.map((birthday) => (
            <div
              key={birthday.contact_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {birthday.contact_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {birthday.age ? `${birthday.age} anos` : 'Idade não informada'}
                    </span>
                  </div>
                </div>
              </div>
              
              {birthday.whatsapp && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={() => {
                      const message = `🎉 Parabéns pelo seu aniversário! Que Deus abençoe sua vida com muita alegria e paz! 🎂`;
                      window.open(
                        `https://wa.me/55${birthday.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                        '_blank'
                      );
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Parabenizar</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
