
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, User, Phone, MapPin, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface City {
  id: string;
  name: string;
  state: string;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

export const ContactFormPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    city_id: '',
    neighborhood_id: ''
  });
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCities();
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (formData.city_id) {
      const filtered = neighborhoods.filter(n => n.city_id === formData.city_id);
      setFilteredNeighborhoods(filtered);
    } else {
      setFilteredNeighborhoods([]);
    }
  }, [formData.city_id, neighborhoods]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const fetchNeighborhoods = async () => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.neighborhood_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedNeighborhood = neighborhoods.find(n => n.id === formData.neighborhood_id);
      
      const { error } = await supabase
        .from('contacts')
        .insert([{
          name: formData.name,
          whatsapp: formData.whatsapp,
          city_id: formData.city_id,
          neighborhood: selectedNeighborhood?.name || '',
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Seus dados foram enviados com sucesso! Entraremos em contato em breve.",
      });

      // Limpar formulário
      setFormData({
        name: '',
        whatsapp: '',
        city_id: '',
        neighborhood_id: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao enviar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Formulário de Contato
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Preencha seus dados para nos conectarmos com você
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp *
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cidade
              </Label>
              <Select 
                value={formData.city_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value, neighborhood_id: '' }))}
              >
                <SelectTrigger className="h-12">
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

            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Bairro *
              </Label>
              <Select 
                value={formData.neighborhood_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood_id: value }))}
                disabled={!formData.city_id}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione um bairro" />
                </SelectTrigger>
                <SelectContent>
                  {filteredNeighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Dados'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
              <Shield className="h-4 w-4" />
              <span>Seus dados serão utilizados apenas para contato da igreja e estão protegidos.</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
