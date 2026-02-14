const fs = require('fs');

const FILE_PATH = 'src/app/shop/page.tsx';

try {
    const content = fs.readFileSync(FILE_PATH, 'utf8');
    const lines = content.split('\n');

    console.log('File Size:', content.length);
    console.log('Total Lines:', lines.length);

    // Find most common 5+ line sequences
    const lineCounts = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 20) {
            lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
        }
    }

    const sorted = Object.entries(lineCounts)
        .filter(([line, count]) => count > 10)
        .sort((a, b) => b[1] - a[1]); // Descending count

    console.log('--- Top Repeated Lines (>10 occurrences) ---');
    sorted.slice(0, 20).forEach(([line, count]) => {
        console.log(`[${count}x]: ${line.substring(0, 60)}...`);
    });

} catch (e) {
    console.error(e);
}
