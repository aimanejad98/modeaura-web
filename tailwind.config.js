/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    gold: "#D4AF37",
                    charcoal: "#121212",
                    paper: "#FDFBF7",
                }
            },
            fontFamily: {
                outfit: ['var(--font-outfit)', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
