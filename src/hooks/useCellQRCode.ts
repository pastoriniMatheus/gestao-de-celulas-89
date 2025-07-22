
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useCellQRCode = () => {
  const [cellId, setCellId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Verificar se estamos em uma URL de QR code de célula
    const searchParams = new URLSearchParams(location.search);
    const qrCellId = searchParams.get('cellId');
    const qrToken = searchParams.get('token');
    
    console.log('useCellQRCode: Verificando parâmetros da URL:', {
      pathname: location.pathname,
      search: location.search,
      cellId: qrCellId,
      token: qrToken
    });

    if (qrCellId && qrToken) {
      console.log('useCellQRCode: QR Code de célula detectado:', qrCellId);
      setCellId(qrCellId);
    } else if (location.pathname.includes('/attendance/') || location.pathname.includes('/member-attendance/')) {
      // Extrair cellId da URL se estiver no formato /attendance/{cellId} ou /member-attendance/{cellId}
      const pathParts = location.pathname.split('/');
      const extractedCellId = pathParts[pathParts.length - 1];
      
      if (extractedCellId && extractedCellId !== 'attendance' && extractedCellId !== 'member-attendance') {
        console.log('useCellQRCode: Cell ID extraído da URL:', extractedCellId);
        setCellId(extractedCellId);
      }
    } else {
      setCellId(null);
    }
  }, [location]);

  return { cellId };
};
