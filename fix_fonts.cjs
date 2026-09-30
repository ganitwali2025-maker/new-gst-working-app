const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/font-weight:\s*800;/g, 'font-weight: 700;');
css = css.replace(/font-weight:\s*900;/g, 'font-weight: 700;');
css = css.replace(/font-weight:\s*bold;/ig, 'font-weight: 700;');
css = css.replace(/font-weight:\s*normal;/ig, 'font-weight: 400;');
css = css.replace(/font-family:\s*inherit;/ig, 'font-family: "Inter", sans-serif;');

// Let's also check if there are any hardcoded font-sizes that are too small or unreadable. 
// "Maintain excellent readability at 100%, 125%, and 150% browser zoom." -> usually handled by standard rem/px sizes, which we've mostly set.

fs.writeFileSync('src/index.css', css);
console.log('Font weights normalized.');
