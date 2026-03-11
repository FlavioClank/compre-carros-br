import { Shield, Clock, Headphones, ThumbsUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Todos os veículos passam por rigorosa inspeção antes de serem anunciados.",
  },
  {
    icon: Clock,
    title: "Processo Ágil",
    description: "Atendimento rápido e eficiente para você encontrar seu carro ideal.",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe especializada para tirar todas as suas dúvidas pelo WhatsApp.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfação Garantida",
    description: "Milhares de clientes satisfeitos com nosso atendimento personalizado.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Por que escolher a <span className="text-accent">CompreCarrosBr</span>?
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base">
            Somos especialistas em intermediação de veículos, garantindo
            segurança e transparência em cada negociação.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-5 md:p-6 border border-border shadow-card card-hover text-center animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold text-card-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
