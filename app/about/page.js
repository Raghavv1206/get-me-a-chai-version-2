// app/about/page.js
"use client"
import AboutHero from '@/components/about/AboutHero';
import Timeline from '@/components/about/Timeline';
import ImpactStats from '@/components/about/ImpactStats';
import Differentiators from '@/components/about/Differentiators';
import TrustBadges from '@/components/about/TrustBadges';
import TeamSection from '@/components/about/TeamSection';
import FAQAccordion from '@/components/about/FAQAccordion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Background Ambient Effects - Same as Dashboard */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
        <div className="max-w-7xl mx-auto space-y-12">

          <AboutHero />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <ImpactStats />
          </div>

          <Timeline />
          <Differentiators />
          <TrustBadges />
          <TeamSection />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
            <FAQAccordion />
          </div>

        </div>
      </main>
    </div>
  );
}
