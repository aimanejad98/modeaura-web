import { getProducts } from '../src/app/actions/inventory'
import { getCategories } from '../src/app/actions/categories'

async function test() {
    try {
        console.log('Fetching products...')
        const products = await getProducts()
        console.log(`Success: Found ${products.length} products.`)

        console.log('Fetching categories...')
        const categories = await getCategories()
        console.log(`Success: Found ${categories.length} categories.`)
    } catch (e) {
        console.error('FAILED:', e)
    }
}

test()
