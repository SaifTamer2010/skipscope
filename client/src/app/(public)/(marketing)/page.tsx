import HeroSection from "@/src/components/sections/marketing/HeroSection";
import StatsBar from "@/src/components/sections/marketing/StatsBar";
import ProductShowcase from "@/src/components/sections/marketing/ProductShowcase";
import HowItWorks from "@/src/components/sections/marketing/HowItWorks";
import IndustriesSection from "@/src/components/sections/marketing/IndustriesSection";
import FeaturesGrid from "@/src/components/sections/marketing/FeaturesGrid";
import ComparisonTable from "@/src/components/sections/marketing/ComparisonTable";
import FAQSection from "@/src/components/sections/marketing/FAQSection";
import TestimonialsSection from "@/src/components/sections/marketing/TestimonialsSection";
import CTASection from "@/src/components/sections/marketing/CTASection";
import MarketingFooter from "@/src/components/layouts/MarketingFooter";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-transparent overflow-x-hidden mt-10">
      <HeroSection />
      <StatsBar />
      <ProductShowcase />
      <HowItWorks />
      <IndustriesSection />
      <FeaturesGrid />
      <ComparisonTable />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />

      <MarketingFooter />

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SkipScope",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD"
            },
            "description": "Precision real estate search and skip tracing platform. Find property owners and verified contact information with 99.8% accuracy.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "512"
            }
          })
        }}
      />
    </div>
  );
}
