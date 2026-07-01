import { useEffect, forwardRef } from "react";
import { Helmet } from "react-helmet-async";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { BrandCarousel } from "@/components/public/BrandCarousel";
import { FeaturedCars } from "@/components/public/FeaturedCars";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { CTASection } from "@/components/public/CTASection";
import { HomeShowcase } from "@/components/public/HomeShowcase";
import { InstallAppSection } from "@/components/public/InstallAppSection";
import { trackSiteVisit } from "@/lib/analytics";
import { canonicalUrl } from "@/lib/seo";

const Index = forwardRef<HTMLDivElement>(function Index(_props, ref) {
  useEffect(() => {
    trackSiteVisit({ path: window.location.pathname || "/" });
  }, []);

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "CompreCarrosBr",
        url: canonicalUrl("/"),
        logo: canonicalUrl("/favicon.jpeg"),
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "CompreCarrosBr",
        url: canonicalUrl("/"),
        potentialAction: {
          "@type": "SearchAction",
          target: `${canonicalUrl("/carros")}?busca={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div ref={ref}>
      <PublicLayout>
        <Helmet>
          <title>CompreCarrosBr - Veículos Seminovos Verificados</title>
          <meta name="description" content="Encontre veículos seminovos verificados de garagens confiáveis. Atendimento personalizado via WhatsApp." />
          <link rel="canonical" href={canonicalUrl("/")} />
          <meta property="og:url" content={canonicalUrl("/")} />
          <script type="application/ld+json">{JSON.stringify(homeJsonLd)}</script>
        </Helmet>
        <h1 className="sr-only">
          Encontre veículos seminovos verificados na CompreCarrosBr
        </h1>
        <HomeShowcase />
        <HeroSection />
        <BrandCarousel />
        <FeaturedCars />
        <InstallAppSection />
        <WhyChooseUs />
        <CTASection />
      </PublicLayout>
    </div>
  );
});

export default Index;
