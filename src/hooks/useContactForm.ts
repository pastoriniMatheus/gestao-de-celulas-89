
import { useState } from 'react';

export interface ContactFormData {
  name: string;
  whatsapp: string;
  email: string;
  city_id: string;
  neighborhood: string;
  referred_by: string;
  cell_id: string;
  birth_date: string;
  encounter_with_god: boolean;
  baptized: boolean;
  photo_url: string | null;
  founder: boolean;
  leader_id: string;
}

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    whatsapp: '',
    email: '',
    city_id: '',
    neighborhood: '',
    referred_by: '',
    cell_id: '',
    birth_date: '',
    encounter_with_god: false,
    baptized: false,
    photo_url: null,
    founder: false,
    leader_id: '',
  });

  const updateFormData = (updates: Partial<ContactFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      whatsapp: '',
      email: '',
      city_id: '',
      neighborhood: '',
      referred_by: '',
      cell_id: '',
      birth_date: '',
      encounter_with_god: false,
      baptized: false,
      photo_url: null,
      founder: false,
      leader_id: '',
    });
  };

  return {
    formData,
    updateFormData,
    resetForm
  };
};
