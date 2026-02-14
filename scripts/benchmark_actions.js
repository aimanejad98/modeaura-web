const { getProducts } = require('../src/app/actions/inventory');
const { getCategories } = require('../src/app/actions/categories');
const { getMaterials } = require('../src/app/actions/materials');
const { getColors } = require('../src/app/actions/colors');
const { getActiveTheme } = require('../src/app/actions/themes');
const { getStoreSettings } = require('../src/app/actions/settings');

async function benchmark() {
    console.log('--- BENCHMARKING SERVER ACTIONS ---');

    async function timeIt(name, fn) {
        console.log(`Starting ${name}...`);
        const start = Date.now();
        try {
            const result = await fn();
            // console.log(`✅ ${name} result:`, result);
            console.log(`✅ ${name} finished in ${Date.now() - start}ms`);
        } catch (e) {
            console.error(`❌ ${name} FAILED after ${Date.now() - start}ms:`, e.message);
        }
    }

    await timeIt('getActiveTheme', getActiveTheme);
    await timeIt('getStoreSettings', getStoreSettings);
    await timeIt('getProducts', getProducts);
    await timeIt('getCategories', getCategories);

    console.log('--- BENCHMARK COMPLETE ---');
    process.exit(0);
}

benchmark();
