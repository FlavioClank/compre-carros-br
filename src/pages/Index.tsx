import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { BrandCarousel } from "@/components/public/BrandCarousel";
import { FeaturedCars } from "@/components/public/FeaturedCars";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { CTASection } from "@/components/public/CTASection";
import { HomeBannerCarousel } from "@/components/public/HomeBannerCarousel";

const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <BrandCarousel />
      <HomeBannerCarousel />
      <FeaturedCars />
      <WhyChooseUs />
      <CTASection />
    </PublicLayout>
  );
};

export default Index;
