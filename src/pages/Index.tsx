import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { FeaturedLivestock } from "@/components/home/FeaturedLivestock";
import { HowItWorks } from "@/components/home/HowItWorks";
import { QualityGuarantee } from "@/components/home/QualityGuarantee";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustIndicators />
        <FeaturedLivestock />
        <HowItWorks />
        <QualityGuarantee />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
