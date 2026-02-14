
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // 1. Get first banner
        const banner = await prisma.banner.findFirst()
        if (!banner) {
            console.log('No banners found to test.')
            return
        }

        console.log('Current Banner:', banner.title, 'Subtitle Color:', banner.subtitleColor)

        // 2. Update subtitleColor
        const newColor = banner.subtitleColor === '#FFFFFF' ? '#D4AF37' : '#FFFFFF'
        console.log('Attempting update to:', newColor)

        const updated = await prisma.banner.update({
            where: { id: banner.id },
            data: { subtitleColor: newColor }
        })

        console.log('Update Success! New Subtitle Color:', updated.subtitleColor)

        // 3. Revert
        // await prisma.banner.update({ where: { id: banner.id }, data: { subtitleColor: banner.subtitleColor } })

    } catch (error) {
        console.error('Update Failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
