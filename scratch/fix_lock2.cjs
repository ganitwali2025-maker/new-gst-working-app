const fs = require('fs');
const p = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GenericTablePage.tsx';
let d = fs.readFileSync(p, 'utf8');
const lines = d.split('\n');

// the button is at lines 64-70 (0-indexed)
// let's verify before replacing
let replaced = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick={() => toggleLock(type)}')) {
    // found it
    lines[i - 2] = '            <button className="btn-action btn-lock" onClick={() => toggleLock(type)}>';
    lines[i - 1] = '              <span className="icon-wrapper">';
    lines[i]     = '                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}';
    lines[i + 1] = '              </span>';
    lines[i + 2] = '              <span>{isLocked ? "Locked" : "Lock Sheet"}</span>';
    lines[i + 3] = '            </button>';
    // remove the extra lines if needed, since the original had 7 lines, mine has 6 lines
    lines.splice(i + 4, 1);
    replaced = true;
    break;
  }
}

if(replaced) {
  fs.writeFileSync(p, lines.join('\n'));
  console.log("Replaced Lock Button");
} else {
  console.log("Could not find toggleLock button");
}
