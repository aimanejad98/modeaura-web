import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import TrendingCollection from '@/components/TrendingAbayas';
import GoogleReviews from '@/components/GoogleReviews';
import BrandStory from '@/components/BrandStory';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import CategoryGrid from '@/components/CategoryGrid';
import NewsletterForm from '@/components/NewsletterForm';
import { ensureDatabaseSeeded } from '@/lib/init-db';

export default async function HomePage() {
    // Self-healing: Ensure DB is populated on first load
    await ensureDatabaseSeeded();

    return (
        <main className="min-h-screen">
            {/* Hero Slider Section */}
            <HeroSlider />

            {/* Trending Collection (New Arrivals) */}
            <TrendingCollection />

            {/* Category Discovery Grid */}
            <CategoryGrid />

            {/* Trust & Community */}
            <GoogleReviews />

            {/* Brand Narrative & Feedback */}
            <BrandStory />

            {/* Knowledge Base */}
            <FAQSection />

            <section
                className="relative py-32 md:py-72 px-6 flex items-center justify-center bg-center bg-cover"
                style={{ backgroundImage: "url('/images/luxury-ceramic-bg.png')" }}
            >
                {/* Subtle cinematic depth vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none"></div>

                <div className="relative max-w-4xl mx-auto text-center space-y-12 w-full z-10">
                    <div className="space-y-6">
                        <h4 className="text-white text-4xl sm:text-5xl md:text-8xl font-display font-medium italic leading-tight drop-shadow-2xl">
                            Become part of the <br />
                            AURA circle.
                        </h4>
                        <p className="text-[var(--gold)] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] drop-shadow-lg opacity-90">Where Fashion Meets Accessories</p>
                    </div>

                    <div className="drop-shadow-2xl">
                        <NewsletterForm />
                    </div>
                </div>
            </section>

            {/* Refined Modular Footer */}
            <Footer />
        </main>
    );
}
