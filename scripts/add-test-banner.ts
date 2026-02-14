import prisma from '../src/lib/db'
import { addBanner } from '../src/app/actions/banners'

async function main() {
    console.log('Attempting to add a test banner...')
    try {
        const banner = await addBanner({
            title: 'Script Test Banner',
            subtitle: 'Added via verification script',
            image: 'https://via.placeholder.com/1920x600',
            active: true,
            order: 100
        })
        console.log('Successfully added banner:', banner)
    } catch (error) {
        console.error('Failed to add banner:', error)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
