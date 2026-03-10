import { Helmet } from "react-helmet-async";
import { Download, Share, MoreVertical, Plus, Smartphone, CheckCircle2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>Instalar App | CompreCarrosBr</title>
        <meta name="description" content="Instale o app CompreCarrosBr no seu celular e tenha acesso rápido aos melhores veículos seminovos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Smartphone className="h-4 w-4" />
                App Gratuito
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight font-[Outfit]">
                Instale o CompreCarrosBr
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-lg mx-auto">
                Tenha acesso rápido aos melhores veículos seminovos direto na tela do seu celular.
              </p>

              {isInstalled ? (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-lg font-semibold">
                  <CheckCircle2 className="h-6 w-6 text-green-300" />
                  App já instalado!
                </div>
              ) : deferredPrompt ? (
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 opacity-80">
                  <ArrowDown className="h-5 w-5 animate-bounce" />
                  <span>Siga as instruções abaixo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vantagens */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 font-[Outfit] text-foreground">
              Por que instalar?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚡",
                  title: "Acesso Rápido",
                  desc: "Abra direto da tela inicial, sem digitar URL.",
                },
                {
                  icon: "📱",
                  title: "Experiência de App",
                  desc: "Visual em tela cheia, como um app nativo.",
                },
                {
                  icon: "🔄",
                  title: "Sempre Atualizado",
                  desc: "Novos veículos aparecem em tempo real.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-border rounded-2xl p-6 text-center space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instruções Android */}
        <div className="bg-muted/50">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Android</span>
                <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-foreground">
                  Como instalar no Android
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    icon: <MoreVertical className="h-5 w-5" />,
                    title: "Abra o menu do Chrome",
                    desc: "Toque nos 3 pontinhos (⋮) no canto superior direito do navegador.",
                  },
                  {
                    step: 2,
                    icon: <Plus className="h-5 w-5" />,
                    title: 'Toque em "Adicionar à tela inicial"',
                    desc: "Ou toque em \"Instalar app\" se aparecer essa opção.",
                  },
                  {
                    step: 3,
                    icon: <Download className="h-5 w-5" />,
                    title: "Confirme a instalação",
                    desc: "Toque em \"Adicionar\" ou \"Instalar\". O ícone aparecerá na sua tela inicial.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.icon}</span>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instruções iOS */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">iPhone / iPad</span>
              <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-foreground">
                Como instalar no iPhone
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  icon: <span className="text-lg">🧭</span>,
                  title: "Abra no Safari",
                  desc: "O Safari é obrigatório no iPhone. Abra o site comprecarrosbr.com.br no Safari.",
                },
                {
                  step: 2,
                  icon: <Share className="h-5 w-5" />,
                  title: "Toque no botão Compartilhar",
                  desc: "É o ícone de quadrado com seta para cima (⬆️) na barra inferior do Safari.",
                },
                {
                  step: 3,
                  icon: <Plus className="h-5 w-5" />,
                  title: '"Adicionar à Tela de Início"',
                  desc: "Role para baixo no menu e toque nesta opção. Depois toque em \"Adicionar\".",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-muted/50 border-t border-border">
          <div className="container mx-auto px-4 py-12 text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold font-[Outfit] text-foreground">
              Pronto! Agora explore os veículos 🚗
            </h2>
            <Link to="/carros">
              <Button size="lg" className="rounded-xl px-8">
                Ver Veículos Disponíveis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Install;
