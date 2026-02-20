import React from 'react';

export default function PolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-light text-center mb-8 uppercase tracking-widest text-slate-800">
                Store Policies
            </h1>

            <div className="prose prose-slate mx-auto">
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Returns & Exchanges</h2>
                    <p className="text-gray-600 mb-4">
                        We accept returns and exchanges within 14 days of purchase. Items must be unworn, unwashed, and with all original tags attached.
                        Please note that sale items and accessories are final sale.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Shipping</h2>
                    <p className="text-gray-600 mb-4">
                        We offer complimentary shipping on all orders over $250. Standard shipping takes 3-5 business days.
                        Express shipping options are available at checkout.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Care Instructions</h2>
                    <p className="text-gray-600 mb-4">
                        To maintain the quality of your Mode Aura garments, we recommend dry cleaning or gentle hand washing.
                        Please refer to the care label inside each garment for specific instructions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                        If you have any questions about our policies, please contact us at <a href="mailto:info@modeaura.ca" className="text-gold-500 hover:underline">info@modeaura.ca</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
