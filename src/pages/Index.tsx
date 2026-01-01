import { useEffect, forwardRef } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { BrandCarousel } from "@/components/public/BrandCarousel";
import { FeaturedCars } from "@/components/public/FeaturedCars";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { CTASection } from "@/components/public/CTASection";
import { HomeBannerCarousel } from "@/components/public/HomeBannerCarousel";
import { trackSiteVisit } from "@/lib/analytics";

const Index = forwardRef<HTMLDivElement>(function Index(_props, ref) {
  useEffect(() => {
    trackSiteVisit({ path: window.location.pathname || "/" });
  }, []);

  return (
    <div ref={ref}>
      <PublicLayout>
        <HomeBannerCarousel />
        <HeroSection />
        <BrandCarousel />
        <FeaturedCars />
        <WhyChooseUs />
        <CTASection />
      </PublicLayout>
    </div>
  );
});

export default Index;
