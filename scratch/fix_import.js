const fs = require('fs');
let content = fs.readFileSync('src/components/common/ImportBox.tsx', 'utf8');

const newBlock = \if (target === 'gstr1') {
        syncGstr1ToSheets(updatedData, "SYNC_ALL").catch(() => {
           showToast("Background sync failed. Please refresh and try again.", "error");
        });
      } else if (target === 'rcm') {
        if(syncRcmToSheets) {
          syncRcmToSheets(updatedData, "SYNC_ALL").catch(() => {
            showToast("Background sync failed. Please refresh and try again.", "error");
          });
        }
      } else if (target === 'books') {
        syncBooksToSheets(updatedData, "SYNC_ALL").catch(() => {
           showToast("Background sync failed. Please refresh and try again.", "error");
        });
      } else if (target === 'g2b_gov') {
        if (syncGstr2bGovToSheets) {
          syncGstr2bGovToSheets(updatedData, "SYNC_ALL").catch(() => {
            showToast("Background sync failed. Please refresh and try again.", "error");
          });
        }
        let currentG2b = gstr2b || [];
        if (replace) {
          currentG2b = currentG2b.filter(r => !(r.companyId === activeCompanyId && r.fy === importFy && r.month === importMonth));
        }
        const updatedG2b = [...currentG2b, ...newRows.map(r => ({ ...r, id: String(Math.random()) }))];
        updateState({ gstr2b: updatedG2b });
      }\;

content = content.replace(/if \(target === 'gstr1'\) \{[\s\S]*?\}\);[\r\n\s]*\}/, newBlock);
fs.writeFileSync('src/components/common/ImportBox.tsx', content);
console.log('Fixed ImportBox');
