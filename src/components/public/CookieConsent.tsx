import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "ccb_cookie_consent";

type ConsentValue = "accepted" | "rejected";

export function getConsentStatus(): ConsentValue | null {
  return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentValue | null;
}

export function hasConsented(): boolean {
  return getConsentStatus() === "accepted";
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getConsentStatus();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
    // Dispara evento para que o Google Analytics possa ser ativado
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: "accepted" }));
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: "rejected" }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                🍪 Utilizamos cookies
              </h3>
              <button
                onClick={handleReject}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar
              conteúdo. Ao clicar em "Aceitar", você concorda com o uso de cookies conforme nossa
              política de privacidade.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                onClick={handleAccept}
                size="sm"
                className="rounded-lg font-semibold text-xs md:text-sm"
              >
                Aceitar Cookies
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="rounded-lg font-semibold text-xs md:text-sm"
              >
                Recusar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
