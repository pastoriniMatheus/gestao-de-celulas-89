import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, User, Phone, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCities } from '@/hooks/useCities';
import { useUniqueAttendanceCode } from '@/hooks/useUniqueAttendanceCode';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

const steps = [
  { id: 'name', title: 'Nome', icon: User, field: 'name' },
  { id: 'whatsapp', title: 'WhatsApp', icon: Phone, field: 'whatsapp' },
  { id: 'city', title: 'Cidade', icon: MapPin, field: 'city_id' },
  { id: 'neighborhood', title: 'Bairro', icon: MapPin, field: 'neighborhood' },
];

export const DynamicEventForm = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [qrInfo, setQrInfo] = useState<any>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodsLoading, setNeighborhoodsLoading] = useState(false);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [formConfig, setFormConfig] = useState<any>({});
  
  const { settings } = useSystemSettings();
  const { cities } = useCities();
  const { generateUniqueAttendanceCode } = useUniqueAttendanceCode();
  const { webhooks } = useWebhookConfigs();
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    city_id: '',
    neighborhood: ''
  });

  const eventId = searchParams.get('evento');
  const cod = searchParams.get('cod');
  const errorCode = searchParams.get('error');

  // Carregar configurações do formulário
  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .in('key', ['form_title', 'form_description', 'form_image_url', 'welcome_message', 'success_message']);

        if (error) throw error;

        const config: any = {};
        data?.forEach((item) => {
          config[item.key] = item.value;
        });

        setFormConfig(config);
      } catch (error) {
        console.error('Erro ao carregar configurações do formulário:', error);
      }
    };

    loadFormConfig();
  }, []);

  // Carregar todos os bairros uma única vez
  useEffect(() => {
    const loadAllNeighborhoods = async () => {
      try {
        console.log('Carregando todos os bairros...');
        
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('Erro ao carregar bairros:', error);
          return;
        }

        console.log('Todos os bairros carregados:', data);
        setAllNeighborhoods(data || []);
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
      }
    };

    loadAllNeighborhoods();
  }, []);

  // Filtrar bairros quando uma cidade é selecionada
  useEffect(() => {
    if (!formData.city_id) {
      setNeighborhoods([]);
      return;
    }

    console.log('Filtrando bairros para cidade:', formData.city_id);
    const filteredNeighborhoods = allNeighborhoods.filter(n => n.city_id === formData.city_id);
    console.log('Bairros filtrados:', filteredNeighborhoods);
    setNeighborhoods(filteredNeighborhoods);
  }, [formData.city_id, allNeighborhoods]);

  // Carregar dados do formulário
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);

        if (eventId && !errorCode) {
          const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

          if (!error && event) {
            setEventInfo(event);
            
            console.log('Incrementando scan_count para evento:', eventId);
            const { error: scanError } = await supabase.rpc('increment_event_scan_count', {
              event_uuid: eventId
            });

            if (scanError) {
              console.error('Erro ao incrementar scan_count:', scanError);
            } else {
              console.log('Scan count incrementado com sucesso');
            }
          }
        }
        
        if (cod && !eventId && !errorCode) {
          const { data: qr, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('keyword', cod)
            .single();

          if (!error && qr) {
            setQrInfo(qr);
            
            const { error: qrError } = await supabase.rpc('increment_qr_scan_count', {
              qr_id: qr.id
            });

            if (qrError) {
              console.error('Erro ao incrementar scan QR:', qrError);
            }
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [eventId, cod, errorCode]);

  // Função para enviar dados para webhook
  const sendToWebhook = async (contactData: any) => {
    try {
      const newContactWebhooks = webhooks.filter(w => w.event_type === 'new_contact' && w.active);
      
      if (newContactWebhooks.length === 0) {
        console.log('Nenhum webhook de novo contato ativo encontrado');
        return;
      }

      const webhookData = {
        name: contactData.name,
        whatsapp: contactData.whatsapp,
        event: 'new_contact',
        timestamp: new Date().toISOString()
      };

      for (const webhook of newContactWebhooks) {
        try {
          console.log('Enviando para webhook:', webhook.webhook_url);
          
          const response = await fetch(webhook.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...webhook.headers
            },
            body: JSON.stringify(webhookData)
          });

          if (response.ok) {
            console.log('Webhook enviado com sucesso:', webhook.name);
          } else {
            console.error('Erro no webhook:', webhook.name, response.statusText);
          }
        } catch (webhookError) {
          console.error('Erro ao enviar webhook:', webhook.name, webhookError);
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhooks:', error);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  
  const canAdvance = () => {
    const field = currentStepData.field;
    return formData[field as keyof typeof formData]?.trim() !== '';
  };

  const handleNext = () => {
    if (canAdvance() && !isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;

    setSubmitting(true);
    try {
      console.log('DynamicEventForm: Iniciando submit do formulário');
      
      const uniqueCode = await generateUniqueAttendanceCode();
      console.log('DynamicEventForm: Código único gerado:', uniqueCode);

      const contactData = {
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        neighborhood: formData.neighborhood.trim(),
        city_id: formData.city_id || null,
        status: 'pending',
        encounter_with_god: false,
        baptized: false,
        attendance_code: uniqueCode
      };

      console.log('DynamicEventForm: Dados do contato:', contactData);

      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);

      if (error) throw error;

      // Enviar para webhook
      await sendToWebhook(contactData);

      // Incrementar scan_count para eventos
      if (eventId && eventInfo) {
        console.log('Incrementando registration_count para evento:', eventId);
        const { error: incrementError } = await supabase.rpc('increment_event_registration', { 
          event_uuid: eventId 
        });

        if (incrementError) {
          console.error('Erro ao incrementar registration_count:', incrementError);
        } else {
          console.log('Registration count incrementado com sucesso');
        }
      }

      // Incrementar scan_count para QR codes se não for evento
      if (qrInfo && !eventId) {
        const { error: qrError } = await supabase
          .from('qr_codes')
          .update({ scan_count: (qrInfo.scan_count || 0) + 1 })
          .eq('id', qrInfo.id);

        if (qrError) {
          console.error('Erro ao incrementar scan QR:', qrError);
        }
      }

      toast({
        title: "Sucesso!",
        description: `Cadastro realizado! Seu código de presença: ${uniqueCode}`
      });

      setCurrentStep(steps.length);

    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar formulário",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Determinar qual imagem usar
  const getFormImage = () => {
    if (formConfig.form_image_url?.url) {
      return formConfig.form_image_url.url;
    }
    return settings.logo_url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Carregando...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep >= steps.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {formConfig.success_message?.text || 'Cadastro Concluído!'}
            </h3>
            <p className="text-gray-600 mb-6">
              Obrigado por se cadastrar. Em breve entraremos em contato!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    const StepIcon = currentStepData.icon;
    
    switch (currentStepData.id) {
      case 'name':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <StepIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Qual é o seu nome?</h2>
              <p className="text-gray-600">Digite seu nome completo</p>
            </div>
            <Input
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="text-center text-lg py-6 border-2 focus:border-blue-500"
              autoFocus
            />
          </div>
        );
      
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <StepIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Seu WhatsApp</h2>
              <p className="text-gray-600">Para entrarmos em contato</p>
            </div>
            <Input
              placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              className="text-center text-lg py-6 border-2 focus:border-green-500"
              autoFocus
            />
          </div>
        );
      
      case 'city':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <StepIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Sua cidade</h2>
              <p className="text-gray-600">Selecione onde você mora</p>
            </div>
            <Select 
              value={formData.city_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value, neighborhood: '' }))}
            >
              <SelectTrigger className="text-center text-lg py-6 border-2 focus:border-purple-500">
                <SelectValue placeholder="Selecione sua cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'neighborhood':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <StepIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Seu bairro</h2>
              <p className="text-gray-600">Selecione seu bairro</p>
            </div>
            
            <Select 
              value={formData.neighborhood} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
              disabled={!formData.city_id}
            >
              <SelectTrigger className="text-center text-lg py-6 border-2 focus:border-orange-500">
                <SelectValue placeholder={
                  !formData.city_id 
                    ? "Selecione primeiro a cidade" 
                    : neighborhoods.length === 0 
                      ? "Nenhum bairro encontrado"
                      : "Selecione seu bairro"
                } />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.name}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.city_id && neighborhoods.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Nenhum bairro encontrado para esta cidade
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
          <div className="relative z-10">
            {getFormImage() && (
              <div className="flex justify-center mb-4">
                <img 
                  src={getFormImage()} 
                  alt="Logo" 
                  className="h-16 w-auto filter drop-shadow-lg"
                />
              </div>
            )}
            <CardTitle className="text-2xl font-bold mb-2">
              {formConfig.form_title?.text || 
               eventInfo?.name || 
               qrInfo?.title || 
               settings.church_name || 'Cadastro'}
            </CardTitle>
            
            {formConfig.form_description?.text && (
              <p className="text-white/90 text-sm mb-2">
                {formConfig.form_description.text}
              </p>
            )}
            
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-8 rounded-full transition-all duration-300",
                    index <= currentStep ? "bg-white" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6"
            >
              Voltar
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitting}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {submitting ? "Enviando..." : "Finalizar"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Avançar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
