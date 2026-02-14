import Image from 'next/image';
import Link from 'next/link';

export default function BrandStory() {
    return (
        <>
            {/* Leave Feedback Section */}
            <section className="py-24 px-6 md:px-24 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-[4/5] overflow-hidden shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.1)]">
                        <Image
                            src="/brand-story.png"
                            alt="Mode AURA Lifestyle"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-8 max-w-lg">
                        <div className="space-y-6">
                            <p className="text-[#1B2936] text-xs md:text-sm leading-[1.8] font-medium opacity-80">
                                Our mission is to become the leading brand for Muslim fashion by offering
                                beautifully crafted garments at a competitive price and creating a space where
                                customers can gain our insight into the modest fashion space. With this in mind,
                                we aim to provide an enjoyable shopping experience every time through our
                                personal approach to customer service.
                            </p>
                            <p className="text-[#1B2936] text-xs md:text-sm leading-[1.8] font-medium opacity-80">
                                Your opinion is very important to us. We appreciate your feedback and will use it
                                to evaluate changes and make improvements to our site.
                            </p>
                        </div>
                        <Link
                            href="/feedback"
                            className="inline-block bg-[#1B2936] text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-colors duration-300"
                        >
                            Leave Feedback
                        </Link>
                    </div>
                </div>
            </section>

            {/* Brand Info Section */}
            <section id="heritage" className="py-48 px-6 bg-[#F3F4F6]">
                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-[#1B2936] text-2xl md:text-3xl font-display font-medium tracking-[0.1em] uppercase">
                            Influential, Innovative and Progressive
                        </h2>
                        <div className="h-[1px] w-20 bg-[#D4AF37]/30 mx-auto"></div>
                    </div>

                    <p className="text-[#1B2936]/60 text-xs md:text-sm leading-[2] max-w-2xl mx-auto font-medium px-4 italic">
                        At Mode AURA, we don't just follow trends; we define the architecture of modest elegance.
                        Our philosophy is rooted in the fusion of tradition and the avant-garde spirit of contemporary fashion.
                        We design for the woman who seeks to stand out, not simply fit in.
                    </p>

                    <Link
                        href="/about"
                        className="inline-block text-[#1B2936] text-[9px] font-black uppercase tracking-[0.4em] border-b border-[#1B2936] pb-2 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                    >
                        Our Heritage
                    </Link>
                </div>
            </section>
        </>
    );
}
