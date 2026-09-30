const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Change Light Theme background to make white cards pop
css = css.replace(/--bg:\s*#F8F9FC;/, '--bg: #EAEFF5;');

fs.writeFileSync('src/index.css', css);
console.log('Background updated to #EAEFF5');
