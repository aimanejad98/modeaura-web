const fs = require('fs');
const path = require('path');

const searchTerm = 'Silk Radiance';
const filesToCheck = [
    'D:/Websites/modeaura/modeaura-web/prisma/dev.db',
    'D:/Websites/modeaura/modeaura-web/dev.db'
];

filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const buffer = fs.readFileSync(file);
        if (buffer.includes(searchTerm)) {
            console.log(`FOUND "${searchTerm}" in ${file} (Size: ${stats.size} bytes)`);
        } else {
            console.log(`NOT FOUND in ${file} (Size: ${stats.size} bytes)`);
        }
    } else {
        console.log(`FILE NOT FOUND: ${file}`);
    }
});
