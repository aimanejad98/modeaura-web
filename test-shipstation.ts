const SHIPSTATION_API_KEY = "c8053c2dfc0e43169b5501d01cd09786";
const SHIPSTATION_API_SECRET = "eeadba3b45f1481abe2b1e1a3924444b";

const authHeader = `Basic ${Buffer.from(`${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`).toString('base64')}`;

async function test() {
    console.log('Testing ShipStation Rate Fetch (fedex_walleted)...');
    try {
        const response = await fetch('https://ssapi.shipstation.com/shipments/getrates', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                carrierCode: "fedex_walleted",
                fromPostalCode: "N9A 3J5",
                toPostalCode: "M5V 2N2",
                toCountry: "CA",
                toState: "ON",
                toCity: "Toronto",
                weight: { value: 1, units: "pounds" },
                dimensions: { units: "inches", length: 1, width: 1, height: 1 },
                residential: true
            })
        });

        console.log('Status Code:', response.status);
        const text = await response.text();
        console.log('CARRIERS:', text);
    } catch (e: any) {
        console.error('FATAL ERROR:', e.message);
    }
}

test();
