const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace all lingering malformed backgrounds like:
// background: var(--accent),#ffb199);
// with
// background: var(--accent);
css = css.replace(/background:\s*var\(--[a-zA-Z0-9-]+\),\s*#[a-fA-F0-9]+\);/g, (match) => {
    return match.split(',')[0] + ';';
});
// also check for any missing closing parentheses
css = css.replace(/background:\s*linear-gradient\([^)]+\),\s*#[a-fA-F0-9]+\);/g, (match) => {
    return match.split(',')[0] + ';';
});

fs.writeFileSync('src/index.css', css);
console.log('Build syntax errors fixed.');
