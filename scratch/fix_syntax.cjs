const fs = require('fs');
const p = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GenericTablePage.tsx';
let d = fs.readFileSync(p, 'utf8');
const lines = d.split('\n');
if (lines[64].includes('<button') && lines[65].includes('<button className="btn-action btn-lock"')) {
    lines.splice(64, 1);
    fs.writeFileSync(p, lines.join('\n'));
    console.log("Fixed syntax error");
} else {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '<button' || lines[i].trim() === '<button') {
           if (lines[i+1].includes('btn-action btn-lock')) {
               lines.splice(i, 1);
               fs.writeFileSync(p, lines.join('\n'));
               console.log("Fixed syntax error generic");
               break;
           }
        }
    }
}
