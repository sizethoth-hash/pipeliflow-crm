import { CtaSection } from './_components/CtaSection'
import { FeaturesSection } from './_components/FeaturesSection'
import { Footer } from './_components/Footer'
import { HeroSection } from './_components/HeroSection'
import { Navbar } from './_components/Navbar'
import { PricingSection } from './_components/PricingSection'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
