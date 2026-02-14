'use client'

import { useState } from 'react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function AIStudioPage() {
    const [studioTab, setStudioTab] = useState<'instagram' | 'newsletter'>('instagram')
    const [productName, setProductName] = useState('')
    const [tone, setTone] = useState('Luxury')
    const [generatedContent, setGeneratedContent] = useState('')
    const [generating, setGenerating] = useState(false)

    async function handleGenerate() {
        setGenerating(true)
        // Simulate AI generation delay
        await new Promise(r => setTimeout(r, 2000))

        let content = ''
        if (studioTab === 'instagram') {
            content = `✨ Elevate your style with the all-new ${productName || 'Mode AURA pieces'}.\n\nDesigned for the modern woman who values elegance, modesty, and a touch of cinematic flair. Whether you're heading to a gala or a private dinner, the ${tone.toLowerCase()} details make all the difference.\n\nShop the collection now at the link in our bio. 🕊️💎\n\n#ModeAURA #LuxuryModestFashion #AbayaStyle #ModestElegance #Couture`
        } else {
            content = `Subject: Discover the Art of Modest Elegance: Our Latest ${tone} Collection\n\nDear AURA Circle,\n\nWe are thrilled to unveil our newest creation: ${productName || 'The Midnight Muse Collection'}.\n\nAt Mode AURA, we believe that true luxury lies in the details. Each piece in this ${tone.toLowerCase()} range has been meticulously crafted to offer you the perfect blend of tradition and high-fashion aesthetics.\n\n[Shop the Ad Now]\n\n"Style is a way to say who you are without having to speak."\n\nStay Iconic,\nThe Mode AURA Team`
        }

        setGeneratedContent(content)
        setGenerating(false)
    }

    return (
        <div className="space-y-8 animate-fade-in text-left">
            <div>
                <h2 className="text-4xl font-display font-medium text-[var(--text-primary)] italic">AI Marketing Studio</h2>
                <p className="text-[var(--text-secondary)] font-medium mt-1">Generate high-converting content for your brand in seconds</p>
            </div>

            <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
                <button
                    onClick={() => { setStudioTab('instagram'); setGeneratedContent(''); }}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${studioTab === 'instagram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Instagram Captions
                </button>
                <button
                    onClick={() => { setStudioTab('newsletter'); setGeneratedContent(''); }}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${studioTab === 'newsletter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Newsletter Ads
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="card p-8 space-y-6">
                    <h3 className="text-xl font-black">Content Parameters</h3>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest text-[#D4AF37]">Product or Collection Name</label>
                        <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g., Silk Midnight Abaya"
                            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest text-[#D4AF37]">Brand Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                        >
                            <option>Luxury</option>
                            <option>Cinematic</option>
                            <option>Minimalist</option>
                            <option>Bold & Iconic</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full gold-btn py-4 text-center justify-center flex items-center gap-3"
                    >
                        {generating ? (
                            <>
                                <span className="animate-spin text-xl">✨</span>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">🪄</span>
                                <span>Create Content</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output */}
                <div className="card p-8 bg-[var(--mocha-bg)] border-[var(--mocha-border)] flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black">Generated Result</h3>
                        {generatedContent && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedContent);
                                    alert('Copied to clipboard!');
                                }}
                                className="text-xs font-bold text-[var(--gold)] uppercase hover:underline"
                            >
                                Copy Text
                            </button>
                        )}
                    </div>

                    {generatedContent ? (
                        <div className="flex-1 bg-white p-6 rounded-2xl border border-[var(--mocha-border)] whitespace-pre-wrap text-sm text-gray-700 leading-relaxed overflow-y-auto">
                            {generatedContent}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic space-y-4">
                            <span className="text-6xl">🖋️</span>
                            <p>Your generated {studioTab} content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <DashboardPageGuide
                pageName={{ en: "AI Marketing Studio", ar: "استوديو التسويق بالذكاء الاصطناعي" }}
                steps={[
                    {
                        title: { en: "Content Mode", ar: "نمط المحتوى" },
                        description: {
                            en: "Switch between Instagram Captions and Newsletter Ads to generate platform-specific marketing content.",
                            ar: "التبديل بين تعليقات انستغرام وإعلانات النشرة الإخبارية لإنشاء محتوى تسويقي مخصص لكل منصة."
                        },
                        icon: "📱"
                    },
                    {
                        title: { en: "Brand Parameters", ar: "معايير العلامة التجارية" },
                        description: {
                            en: "Enter a product name and select the brand tone (Luxury, Cinematic, Minimalist, Bold) to guide the AI.",
                            ar: "أدخل اسم المنتج واختر نبرة العلامة التجارية (فاخر، سينمائي، بسيط، جريء) لتوجيه الذكاء الاصطناعي."
                        },
                        icon: "🎨"
                    },
                    {
                        title: { en: "AI Generation", ar: "التوليد بالذكاء الاصطناعي" },
                        description: {
                            en: "Click 'Create Content' to generate professional marketing copy tailored to your brand aesthetic.",
                            ar: "انقر على 'إنشاء المحتوى' لتوليد نصوص تسويقية احترافية مصممة لجمالية علامتك التجارية."
                        },
                        icon: "🪄"
                    },
                    {
                        title: { en: "Copy & Deploy", ar: "نسخ ونشر" },
                        description: {
                            en: "Review the generated result, copy it to clipboard, and post directly to your marketing channels.",
                            ar: "راجع النتيجة المُنشأة، انسخها إلى الحافظة، وانشرها مباشرة على قنوات التسويق الخاصة بك."
                        },
                        icon: "📋"
                    }
                ]}
            />
        </div>
    )
}
