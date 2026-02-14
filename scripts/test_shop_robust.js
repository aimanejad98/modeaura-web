const { getProducts } = require('../src/app/actions/inventory');
const { getCategories } = require('../src/app/actions/categories');
const { getMaterials } = require('../src/app/actions/materials');
const { getColors } = require('../src/app/actions/colors');

async function test(name, fn) {
    console.log(`Testing ${name}...`);
    try {
        const result = await fn();
        console.log(`   ✅ ${name} success. Items: ${Array.isArray(result) ? result.length : 'N/A'}`);
        return result;
    } catch (e) {
        console.error(`   ❌ ${name} FAILED:`, e.message);
        return null;
    }
}

async function runAll() {
    console.log('--- DB INTEGRITY TEST ---');
    await test('Products', getProducts);
    await test('Categories', getCategories);
    await test('Materials', getMaterials);
    await test('Colors', getColors);
    console.log('--- TEST COMPLETE ---');
    process.exit(0);
}

runAll();
