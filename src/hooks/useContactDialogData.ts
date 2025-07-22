
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Cell {
  id: string;
  name: string;
}

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

interface Contact {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useContactDialogData = (isOpen: boolean) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [cellsData, citiesData, neighborhoodsData, contactsData, profilesData] = await Promise.all([
        supabase.from('cells').select('id, name').eq('active', true).order('name'),
        supabase.from('cities').select('id, name, state').eq('active', true).order('name'),
        supabase.from('neighborhoods').select('id, name, city_id').eq('active', true).order('name'),
        supabase.from('contacts').select('id, name').order('name'),
        supabase.from('profiles').select('id, name, email, role').eq('active', true).order('name')
      ]);

      setCells(cellsData.data || []);
      setCities(citiesData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
      setContacts(contactsData.data || []);
      setProfiles(profilesData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getFilteredNeighborhoods = (cityId: string) => {
    if (!cityId) return [];
    return neighborhoods.filter(n => n.city_id === cityId);
  };

  return {
    cells,
    cities,
    neighborhoods,
    contacts,
    profiles,
    getFilteredNeighborhoods
  };
};
