const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🎨 Pre-populating Colors...');

    const colors = [
        // Classic & Neutral
        { name: 'Midnight Black', hex: '#000000' },
        { name: 'Jet Black', hex: '#0a0a0a' },
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Ivory', hex: '#FFFFF0' },
        { name: 'Silver Gray', hex: '#C0C0C0' },
        { name: 'Charcoal', hex: '#36454F' },

        // Browns & Earth Tones
        { name: 'Coffee Brown', hex: '#4B3621' },
        { name: 'Chocolate', hex: '#7B3F00' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Sand Beige', hex: '#D2B48C' },
        { name: 'Taupe', hex: '#483C32' },
        { name: 'Mocha', hex: '#A38068' },
        { name: 'Khaki', hex: '#F0E68C' },

        // Blues & Navies
        { name: 'Royal Navy', hex: '#002366' },
        { name: 'Midnight Blue', hex: '#191970' },
        { name: 'Steel Blue', hex: '#4682B4' },
        { name: 'Sky Blue', hex: '#87CEEB' },
        { name: 'Dusty Blue', hex: '#8C92AC' },

        // Greens
        { name: 'Emerald Green', hex: '#50C878' },
        { name: 'Forest Green', hex: '#228B22' },
        { name: 'Olive Green', hex: '#808000' },
        { name: 'Sage Green', hex: '#BCB88A' },
        { name: 'Mint', hex: '#F5FFFA' },

        // Reds, Pinks & Purples
        { name: 'Burgundy', hex: '#800020' },
        { name: 'Maroon', hex: '#800000' },
        { name: 'Rose Gold', hex: '#B76E79' },
        { name: 'Dusty Rose', hex: '#DCAE96' },
        { name: 'Blush Pink', hex: '#FEF0E3' },
        { name: 'Plum Purple', hex: '#8E4585' },
        { name: 'Lavender', hex: '#E6E6FA' },

        // Golds & Accents
        { name: 'Classic Gold', hex: '#D4AF37' },
        { name: 'Champagne', hex: '#F7E7CE' },
        { name: 'Bronze', hex: '#CD7F32' }
    ];

    let count = 0;
    for (const color of colors) {
        try {
            await prisma.color.upsert({
                where: { name: color.name },
                update: { hex: color.hex },
                create: color
            });
            count++;
        } catch (e) {
            console.error(`Failed to seed ${color.name}:`, e);
        }
    }

    console.log(`✅ Successfully seeded ${count} colors.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
