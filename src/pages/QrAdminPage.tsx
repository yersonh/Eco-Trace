import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Printer, Plus, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ecoLogo from "@/assets/eco-logo.png";
import { LOCATIONS } from "@/constants/locations";

interface Caneca {
  locKey: string;
  canecaId: string;
}

const BASE_URL = window.location.origin;

const buildUrl = (locKey: string, canecaId: string) =>
  `${BASE_URL}/reciclar?loc=${locKey}${canecaId ? `&id=${canecaId}` : ""}`;

// ── Tarjeta individual de QR ─────────────────────────────────────────────────
const QrCard = ({ locKey, canecaId }: { locKey: string; canecaId: string }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const url = buildUrl(locKey, canecaId);
  const locationName = LOCATIONS[locKey] ?? locKey;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `QR-${locKey}${canecaId ? `-${canecaId}` : ""}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-card-eco flex flex-col items-center gap-3 print:shadow-none print:border print:break-inside-avoid">
      <p className="font-display font-bold text-sm text-center text-primary leading-tight">
        {locationName}
      </p>
      {canecaId && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Caneca #{canecaId}
        </span>
      )}

      <div ref={canvasRef} className="p-2 bg-white rounded-xl">
        <QRCodeCanvas
          value={url}
          size={160}
          level="H"
          imageSettings={{
            src: ecoLogo,
            height: 28,
            width: 28,
            excavate: true,
          }}
        />
      </div>

      <p className="text-[10px] text-muted-foreground text-center break-all px-1">
        {url}
      </p>

      <Button
        size="sm"
        variant="outline"
        className="w-full print:hidden"
        onClick={handleDownload}
      >
        <Download size={14} /> Descargar PNG
      </Button>
    </div>
  );
};

// ── Página principal ─────────────────────────────────────────────────────────
const QrAdminPage = () => {
  const allLocKeys = Object.keys(LOCATIONS);

  // Estado: lista de canecas a generar (locKey + canecaId)
  const [canecas, setCanecas] = useState<Caneca[]>(
    allLocKeys.map((k) => ({ locKey: k, canecaId: "C01" }))
  );
  const [newLoc, setNewLoc]       = useState(allLocKeys[0]);
  const [newId, setNewId]         = useState("");

  const addCaneca = () => {
    if (!newLoc) return;
    setCanecas((prev) => [...prev, { locKey: newLoc, canecaId: newId.trim() }]);
    setNewId("");
  };

  const removeCaneca = (idx: number) =>
    setCanecas((prev) => prev.filter((_, i) => i !== idx));

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-card/90 backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <img src={ecoLogo} alt="EcoVilla" className="h-7 w-7" />
          <span className="font-display font-bold text-gradient-eco">Generador de QR</span>
          <Button className="ml-auto bg-gradient-eco" onClick={handlePrint}>
            <Printer size={16} /> Imprimir todos
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-8">

        {/* ── Agregar caneca extra ── */}
        <section className="bg-card border border-border/50 rounded-3xl p-5 shadow-card-eco print:hidden">
          <h2 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-primary" /> Agregar caneca adicional
          </h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <Label className="text-xs mb-1 block">Barrio / Punto</Label>
              <select
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
              >
                {allLocKeys.map((k) => (
                  <option key={k} value={k}>{LOCATIONS[k]}</option>
                ))}
              </select>
            </div>
            <div className="w-36">
              <Label className="text-xs mb-1 block">ID caneca (opcional)</Label>
              <Input
                placeholder="Ej: C02"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <Button onClick={addCaneca} className="bg-gradient-eco h-10">
              <Plus size={16} /> Agregar
            </Button>
          </div>
        </section>

        {/* ── Lista de canecas configuradas ── */}
        <section className="print:hidden">
          <h2 className="font-display font-bold text-base mb-3">
            Canecas configuradas ({canecas.length})
          </h2>
          <div className="space-y-2">
            {canecas.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40"
              >
                <span className="text-sm font-medium flex-1">
                  {LOCATIONS[c.locKey] ?? c.locKey}
                  {c.canecaId && <span className="text-muted-foreground ml-2 text-xs">#{c.canecaId}</span>}
                </span>
                <code className="text-[10px] text-muted-foreground hidden sm:block truncate max-w-xs">
                  {buildUrl(c.locKey, c.canecaId)}
                </code>
                <button
                  onClick={() => removeCaneca(idx)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grid de QR codes ── */}
        <section>
          <h2 className="font-display font-bold text-base mb-4 print:hidden">
            Códigos QR para imprimir
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {canecas.map((c, idx) => (
              <QrCard key={idx} locKey={c.locKey} canecaId={c.canecaId} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default QrAdminPage;
