const fs = require('fs');

const FILE_PATH = 'src/app/shop/page.tsx';

try {
    const content = fs.readFileSync(FILE_PATH, 'utf8');

    // Robust Regex
    // Matches "function PriceFilter" ... "return (" ... ");" ... "}"
    // Captures indentation before function to clean it up.
    // Replaces with "}" (assuming the matching block replaced "}")

    // Note: escape parens
    const regex = /\s*function PriceFilter\(\{[\s\S]*?return \([\s\S]*?\);\s*\}/g;

    let count = 0;
    const newContent = content.replace(regex, (match) => {
        count++;
        return '}';
    });

    console.log(`Replaced ${count} occurrences.`);

    fs.writeFileSync(FILE_PATH, newContent, 'utf8');
    console.log('Restored file size:', newContent.length);

} catch (e) {
    console.error(e);
}
