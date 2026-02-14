import { getProducts } from '../src/app/actions/inventory';
import { getCategories } from '../src/app/actions/categories';
import { getMaterials } from '../src/app/actions/materials';
import { getColors } from '../src/app/actions/colors';

async function testShopData() {
    console.log('--- TESTING SHOP DATA ACTIONS ---');
    try {
        console.log('1. Fetching Products...');
        const products = await getProducts();
        console.log(`   ✅ Found ${products.length} products.`);

        console.log('2. Fetching Categories...');
        const categories = await getCategories();
        console.log(`   ✅ Found ${categories.length} categories.`);

        console.log('3. Fetching Materials...');
        const materials = await getMaterials();
        console.log(`   ✅ Found ${materials.length} materials.`);

        console.log('4. Fetching Colors...');
        const colors = await getColors();
        console.log(`   ✅ Found ${colors.length} colors.`);

        console.log('--- ALL ACTIONS SUCCESSFUL ---');
    } catch (error) {
        console.error('--- ACTION FAILED ---');
        console.error(error);
    }
}

testShopData();
