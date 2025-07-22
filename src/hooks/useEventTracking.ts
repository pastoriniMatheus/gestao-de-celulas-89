
import { useEffect } from 'react';
import { useEvents } from './useEvents';

export const useEventTracking = () => {
  const { incrementScanCount, incrementRegistrationCount } = useEvents();

  // Função para rastrear scan de QR code
  const trackQRScan = async (eventId: string) => {
    try {
      console.log('Rastreando scan do QR code para evento:', eventId);
      await incrementScanCount(eventId);
    } catch (error) {
      console.error('Erro ao rastrear scan:', error);
    }
  };

  // Função para rastrear registro/cadastro
  const trackRegistration = async (eventId: string) => {
    try {
      console.log('Rastreando registro para evento:', eventId);
      await incrementRegistrationCount(eventId);
    } catch (error) {
      console.error('Erro ao rastrear registro:', error);
    }
  };

  return {
    trackQRScan,
    trackRegistration
  };
};
