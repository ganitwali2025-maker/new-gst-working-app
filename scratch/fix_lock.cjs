const fs = require('fs');
const path1 = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GenericTablePage.tsx';
let content = fs.readFileSync(path1, 'utf8');

const target = `<button 
              className="btn"
              
              onClick={() => toggleLock(type)}
            >
              {isLocked ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Lock Sheet</>}
            </button>`;

const repl = `<button className="btn-action btn-lock" onClick={() => toggleLock(type)}>
              <span className="icon-wrapper">
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </span>
              <span>{isLocked ? 'Locked' : 'Lock Sheet'}</span>
            </button>`;

content = content.replace(target, repl);
fs.writeFileSync(path1, content);
console.log("Replaced");
