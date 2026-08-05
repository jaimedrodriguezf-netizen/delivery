import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import ApiDocsSection from '../components/landing/ApiDocsSection';
import Footer from '../components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />
      <FeaturesGrid />
      <ApiDocsSection />
      <Footer />
    </main>
  );
}
