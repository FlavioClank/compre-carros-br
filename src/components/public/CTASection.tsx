import { WHATSAPP_NUMBER, SITE_NAME, generateWhatsAppUrl } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, Search, CheckCircle2, Eye, MessageCircle, ShieldCheck } from "lucide-react";
import logoImg from "@/assets/logo-new.jpeg";
import { Link } from "react-router-dom";

const promises = [
  {
    icon: Eye,
    title: "Transparência real",
    description: "Fotos reais, preços reais. Sem surpresas na hora de ver o veículo.",
  },
  {
    icon: ShieldCheck,
    title: "Veículos verificados",
    description: "Cada anúncio é revisado antes de ir ao ar. Sua segurança vem primeiro.",
  },
  {
    icon: MessageCircle,
    title: "Atendimento humano",
    description: "Nada de robôs. Você fala direto com quem entende de verdade.",
  },
  {
    icon: CheckCircle2,
    title: "Sem enrolação",
    description: "Viu, gostou, chamou no WhatsApp. Simples assim.",
  },
];


export function CTASection() {
  return (
    <>
      {/* Our Promise / Differentials */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              Nosso compromisso
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              O que você pode esperar da gente
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-lg mx-auto">
              Somos novos, mas nascemos com um propósito claro: mudar a forma como você compra seu veículo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-5xl mx-auto">
            {promises.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-card rounded-2xl p-5 md:p-6 border border-border text-center shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg md:text-xl mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Memorable Slogan Band */}
      <section className="relative py-14 md:py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Seu próximo carro está a <br className="hidden sm:block" />
              <span className="text-accent">um clique</span> de distância.
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto">
              Não perca tempo em dezenas de sites. Aqui você encontra veículos verificados, 
              preços reais e atendimento humano via WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={generateWhatsAppUrl(WHATSAPP_NUMBER, "Olá! Vi o site CompreCarrosBr e gostaria de saber mais sobre os veículos disponíveis.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 gap-2 h-14 text-lg w-full sm:w-auto shadow-lg"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Falar pelo WhatsApp
                </Button>
              </a>

              <Link to="/carros">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 gap-2 h-14 text-lg w-full sm:w-auto"
                >
                  <Search className="h-5 w-5" />
                  Ver Veículos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final brand anchor */}
      <section className="py-10 md:py-14 bg-foreground text-background">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 text-center md:text-left">
              <img src={logoImg} alt="CompreCarrosBr" className="h-20 w-20 rounded-xl object-cover shadow-lg" />
              <div>
                <p className="font-display text-xl md:text-2xl font-bold">
                  CompreCarrosBr
                </p>
                <p className="text-background/60 text-sm mt-1">
                  O lugar certo pra quem quer comprar certo. 🚗
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={generateWhatsAppUrl(WHATSAPP_NUMBER, "Olá! Quero saber mais sobre os veículos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-accent/90 transition-colors shadow-md"
              >
                Fale Conosco
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
