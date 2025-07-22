
import { useMemo } from "react";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";

type CellQrCodeProps = {
  cellId: string;
};

export function CellQrCode({ cellId }: CellQrCodeProps) {
  // Link único para presença usando o domínio atual dinamicamente
  const cellUrl = useMemo(() => {
    const currentOrigin = window.location.origin;
    const url = `${currentOrigin}/cell-attendance/${cellId}`;
    console.log('CellQrCode: URL gerada:', url);
    return url;
  }, [cellId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cellUrl);
  };

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-cell-${cellId}`) as HTMLCanvasElement;
    if (canvas) {
      const img = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = img;
      link.download = `celula-presenca-${cellId}.png`;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <QRCode
        id={`qr-cell-${cellId}`}
        value={cellUrl}
        size={180}
        bgColor="#fff"
        fgColor="#1e40af"
        includeMargin
        renderAs="canvas"
        style={{ borderRadius: 12, border: "1px solid #bcd" }}
      />
      <div className="text-xs mt-2 break-all text-center max-w-xs">
        {cellUrl}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy}>Copiar link</Button>
        <Button size="sm" variant="outline" onClick={handleDownload}>Baixar QR</Button>
      </div>
    </div>
  );
}
