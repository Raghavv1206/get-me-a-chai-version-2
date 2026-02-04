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
    <main className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-800/20 rounded-full blur-3xl" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-700/20 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20">
        <AboutHero />
        <ImpactStats />
        <Timeline />
        <Differentiators />
        <TrustBadges />
        <TeamSection />
        <FAQAccordion />
      </div>
    </main>
  );
}
