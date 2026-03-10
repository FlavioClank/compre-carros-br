import { useState, useEffect } from "react";
import { Smartphone, Download, ArrowRight, X } from "lucide-react";
import logoImg from "@/assets/logo-new.jpeg";
import qrcodeImg from "@/assets/qrcode-install.jpg";
import badgeAppStore from "@/assets/badge-app-store.png";
import badgeGooglePlay from "@/assets/badge-google-play.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function InstallAppBanner() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    const wasDismissed = sessionStorage.getItem("ccb_install_dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("ccb_install_dismissed", "1");
  };

  return (
    <section className="py-10 md:py-16 relative overflow-hidden">
      <div className="container">
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/85 rounded-3xl p-6 md:p-10 lg:p-14 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-primary-foreground/50 hover:text-primary-foreground transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Phone mockup */}
            <div className="flex-shrink-0">
              <div className="relative w-52 h-52 md:w-60 md:h-60">
                {/* Glow */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
                {/* Phone frame */}
                <div className="relative w-full h-full bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center p-4">
                  <div className="text-center space-y-2">
                    <img src={logoImg} alt="CompreCarrosBr" className="h-36 w-36 md:h-40 md:w-40 lg:h-44 lg:w-44 rounded-2xl mx-auto object-cover shadow-lg" />
                    <span className="text-primary-foreground/80 text-xs font-medium block">CompreCarrosBr</span>
                  </div>
                  {/* Notification badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">
                    !
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left space-y-5 text-primary-foreground">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Download className="h-3 w-3" />
                  Grátis
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-[Outfit] leading-tight">
                  Tenha o CompreCarrosBr<br className="hidden md:block" /> no seu celular!
                </h2>
              </div>

              <p className="text-base md:text-lg text-primary-foreground/85 max-w-lg mx-auto lg:mx-0">
                Instale nosso app gratuitamente e receba os melhores veículos seminovos
                direto na tela do seu celular. Rápido, leve e sempre atualizado.
              </p>

              <div className="flex flex-col items-center lg:flex-row gap-2 justify-center lg:justify-start">
                <Link to="/instalar" className="transition-transform hover:scale-105 inline-flex w-fit overflow-hidden rounded-xl">
                  <img src={badgeAppStore} alt="Disponível na App Store" className="h-14 sm:h-16 lg:h-14 w-auto object-contain scale-[1.8]" />
                </Link>
                <Link to="/instalar" className="transition-transform hover:scale-105 inline-flex w-fit overflow-hidden rounded-xl">
                  <img src={badgeGooglePlay} alt="Disponível no Google Play" className="h-14 sm:h-16 lg:h-14 w-auto object-contain scale-[1.8]" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 justify-center lg:justify-start text-primary-foreground/60 text-xs">
                <span className="flex items-center gap-1">✓ Sem ocupar espaço</span>
                <span className="flex items-center gap-1">✓ Android e iPhone</span>
                <span className="flex items-center gap-1">✓ 100% gratuito</span>
              </div>
            </div>

            {/* QR Code - Desktop only */}
            <div className="hidden lg:flex flex-shrink-0">
              <div className="relative w-60 h-60 flex flex-col items-center justify-center gap-3">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
                <p className="relative text-primary-foreground/90 text-sm font-medium text-center leading-snug">
                  Está no computador?<br />Baixe pelo celular aqui 😉
                </p>
                <div className="relative bg-white rounded-2xl p-3 shadow-lg">
                  <img src={qrcodeImg} alt="QR Code para instalar o app" className="w-36 h-36 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
