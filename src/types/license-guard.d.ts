
interface QRData {
  eventId: string;
  eventName: string;
  keyword: string;
  url: string;
  timestamp: number;
  domain: string;
  scanCount: number;
  active: boolean;
}

interface LicenseGuardType {
  generateUniqueId(): string;
  generateUniqueUrl(keyword: string, eventId: string): string;
  validateQRCode(url: string): boolean;
  generateQRData(eventName: string, keyword: string): QRData;
  registerScan(eventId: string): any;
  checkSystemIntegrity(): any;
}

declare global {
  interface Window {
    LicenseGuard: LicenseGuardType;
    generateSecureQR: (eventName: string, keyword: string) => QRData;
  }
}

export {};
