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
import ThemeToggle from "@/src/components/ui/ThemeToggle";

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

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-border-muted mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-50 hover:opacity-100 transition-opacity">
          <div className="text-xl font-black text-text-primary tracking-tighter uppercase italic">SKIPSCOPE<span className="text-brand-primary">.</span></div>
          <div className="flex gap-8 text-sm text-text-secondry font-medium items-center">
            <span className="cursor-pointer hover:text-text-primary transition-colors uppercase italic">Privacy</span>
            <span className="cursor-pointer hover:text-text-primary transition-colors uppercase italic">Terms</span>
            <span className="cursor-pointer hover:text-text-primary transition-colors uppercase italic">Support</span>
            <div className="pl-4 border-l border-border-muted ml-4">
              <ThemeToggle />
            </div>
          </div>
          <div className="text-xs text-text-secondry font-medium italic">© 2026 Skipscope Data Labs</div>
        </div>
      </footer>

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
