const fs = require('fs');

const FILE_PATH = 'src/app/shop/page.tsx';

try {
    const content = fs.readFileSync(FILE_PATH, 'utf8');

    // 1. Remove Debris starting with specific className tail
    // Matches className="w-full..." until );
    const tailRegex = /className="w-full py-4 bg-white border-2 border-black[\s\S]*?\);/g;

    let count = 0;
    let newContent = content.replace(tailRegex, (match) => {
        count++;
        return '';
    });

    console.log(`Removed ${count} debris tails.`);

    // 2. Fix double braces ;}} -> ;}
    // Only target specific pattern likely caused by previous fix
    // ;}}
    const braceRegex = /;\}\}/g;
    let braceCount = 0;
    newContent = newContent.replace(braceRegex, () => {
        braceCount++;
        return ';}';
    });
    console.log(`Fixed ${braceCount} double braces.`);

    fs.writeFileSync(FILE_PATH, newContent, 'utf8');
    console.log('Cleaned file size:', newContent.length);

} catch (e) {
    console.error(e);
}
