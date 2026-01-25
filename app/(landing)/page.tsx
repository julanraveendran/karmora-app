import {
  Navigation,
  HeroSection,
  ProblemSolution,
  WorkflowSection,
  BentoGrid,
  TestimonialMarquee,
  PricingSection,
  Footer,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSolution />
        <WorkflowSection />
        <BentoGrid />
        <TestimonialMarquee />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
