const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const scriptUrlStr = 'const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDt5t_rYT0ERzntmc41E0OSW4wkdmgZu55SAWmKX-eOkTWhRcK7GmMZnGoC57zLwen/exec";';

const syncFuncs = \
  \

  const fetchGstr1FromSheets = async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?type=gstr1');
      const sheetData = await res.json();
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => {
          let dStr = r["invoiceDate"] || r["Invoice Date"] || "";
          if (dStr && dStr.includes("T") && dStr.endsWith("Z")) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              dStr = \\\\/\/\\\\;
            }
          }
          return {
            id: String(Math.random()),
            companyId: state.activeCompanyId,
            fy: r["fy"] || r["Financial Year"] || state.financialYear,
            month: r["month"] || r["Month"] || state.month,
            quarter: r["quarter"] || r["Quarter"] || "",
            invoiceDate: dStr,
            supplierName: r["supplierName"] || r["Supplier / Party Name"] || "",
            gstin: r["gstin"] || r["GST No"] || "",
            invoiceNo: r["invoiceNo"] || r["Invoice No"] || "",
            taxable: Number(r["taxable"] || r["Taxable Value"]) || 0,
            igst: Number(r["igst"] || r["IGST"]) || 0,
            cgst: Number(r["cgst"] || r["CGST"]) || 0,
            sgst: Number(r["sgst"] || r["SGST"]) || 0
          };
        });
        updateState({ gstr1: mappedData });
      }
    } catch (e) {
      console.error('Failed to fetch GSTR-1:', e);
    }
  };

  const syncGstr1ToSheets = async (dataToSync, action = "SYNC_ALL") => {
    try {
      let payload = { action, type: 'gstr1', data: dataToSync };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync GSTR-1:', e);
    }
  };

  const fetchBooksFromSheets = async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?type=books');
      const sheetData = await res.json();
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => {
          let dStr = r["invoiceDate"] || r["Invoice Date"] || "";
          if (dStr && dStr.includes("T") && dStr.endsWith("Z")) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              dStr = \\\\/\/\\\\;
            }
          }
          return {
            id: String(Math.random()),
            companyId: state.activeCompanyId,
            fy: r["fy"] || r["Financial Year"] || state.financialYear,
            month: r["month"] || r["Month"] || state.month,
            quarter: r["quarter"] || r["Quarter"] || "",
            invoiceDate: dStr,
            supplierName: r["supplierName"] || r["Name of Supplier"] || "",
            gstin: r["gstin"] || r["GST No."] || "",
            invoiceNo: r["invoiceNo"] || r["Invoice No"] || "",
            taxable: Number(r["taxable"] || r["BESIC AS PER BOOK"]) || 0,
            igst: Number(r["igst"] || r["Integrated Tax (?)"]) || 0,
            cgst: Number(r["cgst"] || r["Central Tax (?)"]) || 0,
            sgst: Number(r["sgst"] || r["State Tax (?)"]) || 0,
            cess: Number(r["cess"] || r["Cess"]) || 0
          };
        });
        updateState({ books: mappedData });
      }
    } catch (e) {
      console.error('Failed to fetch Books ITC:', e);
    }
  };

  const syncBooksToSheets = async (dataToSync, action = "SYNC_ALL") => {
    try {
      let payload = { action, type: 'books', data: dataToSync };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync Books ITC:', e);
    }
  };

  const fetchRcmFromSheets = async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?type=rcm');
      const sheetData = await res.json();
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => {
          let dStr = r["entryDate"] || r["Entry Date"] || "";
          if (dStr && dStr.includes("T") && dStr.endsWith("Z")) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              dStr = \\\\/\/\\\\;
            }
          }
          return {
            id: String(Math.random()),
            companyId: state.activeCompanyId,
            fy: r["fy"] || r["Financial Year"] || state.financialYear,
            month: r["month"] || r["Month"] || state.month,
            quarter: r["quarter"] || r["Quarter"] || "",
            entryDate: dStr,
            transporterName: r["transporterName"] || r["Transporter Name"] || "",
            lrNo: r["lrNo"] || r["Transporter L.R. No."] || "",
            amount: Number(r["taxable"] || r["Amount"]) || 0,
            taxable: Number(r["taxable"] || r["Amount"]) || 0,
            igst: Number(r["igst"] || r["IGST 5%"]) || 0,
            cgst: Number(r["cgst"] || r["CGST 2.5%"]) || 0,
            sgst: Number(r["sgst"] || r["SGST 2.5%"]) || 0
          };
        });
        updateState({ rcm: mappedData });
      }
    } catch (e) {
      console.error('Failed to fetch RCM:', e);
    }
  };

  const syncRcmToSheets = async (dataToSync, action = "SYNC_ALL") => {
    try {
      let payload = { action, type: 'rcm', data: dataToSync };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync RCM:', e);
    }
  };

  const fetchGstr2bGovFromSheets = async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?type=g2b_gov');
      const sheetData = await res.json();
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => {
          let dStr = r["invoiceDate"] || r["Date"] || "";
          if (dStr && dStr.includes("T") && dStr.endsWith("Z")) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              dStr = \\\\/\/\\\\;
            }
          }
          return {
            id: String(Math.random()),
            companyId: state.activeCompanyId,
            fy: r["fy"] || r["Financial Year"] || state.financialYear,
            month: r["month"] || r["Month"] || state.month,
            quarter: r["quarter"] || r["Quarter"] || "",
            invoiceDate: dStr,
            supplierName: r["supplierName"] || r["Trade / Legal Name"] || "",
            gstin: r["gstin"] || r["GSTIN of Supplier"] || "",
            invoiceNo: r["invoiceNo"] || r["Invoice No"] || "",
            taxable: Number(r["taxable"] || r["Taxable Value (?)"]) || 0,
            igst: Number(r["igst"] || r["IGST (?)"]) || 0,
            cgst: Number(r["cgst"] || r["CGST (?)"]) || 0,
            sgst: Number(r["sgst"] || r["SGST (?)"]) || 0,
            cess: Number(r["cess"] || r["CESS (?)"]) || 0,
            remark: r["remark"] || r["Remark"] || ""
          };
        });
        updateState({ gstr2b_gov: mappedData });
      }
    } catch (e) {
      console.error('Failed to fetch 2B GOV:', e);
    }
  };

  const syncGstr2bGovToSheets = async (dataToSync, action = "SYNC_ALL") => {
    try {
      let payload = { action, type: 'g2b_gov', data: dataToSync };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync 2B GOV:', e);
    }
  };
\;

// Replace SCRIPT_URL through the end of syncGstr1ToSheets dummy implementation
content = content.replace(/const SCRIPT_URL = [\s\S]*?\/\/ Removed external fetch to SCRIPT_URL to keep it frontend-only\.\r?\n  \};/, syncFuncs);

// Add currentGstr2bGov logic
content = content.replace('const currentGstr2b = ', 'const currentGstr2bGov = (state.gstr2b_gov || []).filter(r => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month);\n  const currentGstr2b = ');

// Make sure other arrays are safe
content = content.replace(/state\.books\.filter/g, '(state.books || []).filter');
content = content.replace(/state\.gstr2b\.filter/g, '(state.gstr2b || []).filter');
content = content.replace(/state\.rcm\.filter/g, '(state.rcm || []).filter');
content = content.replace(/state\.gstr1\.filter/g, '(state.gstr1 || []).filter');

// Fix clearCurrentPeriod
const clearRegex = /const clearCurrentPeriod = \(type\) => \{[\s\S]*?\};\r?\n/;
const newClear = \const clearCurrentPeriod = (type) => {
    const storeKey = type === 'g2b_gov' ? 'gstr2b_gov' : type;
    if (!state[storeKey]) return;
    const newData = state[storeKey].filter(
      (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
    );
    updateState({ [storeKey]: newData });
    if (type === 'gstr1') syncGstr1ToSheets(newData);
    if (type === 'books') syncBooksToSheets(newData);
    if (type === 'rcm') syncRcmToSheets(newData);
    if (type === 'g2b_gov') syncGstr2bGovToSheets(newData);
  };
\;
content = content.replace(clearRegex, newClear);

// Ensure exports
const exportsBlock = \
    syncGstr1ToSheets,
    fetchGstr1FromSheets,
    syncBooksToSheets,
    fetchBooksFromSheets,
    syncRcmToSheets,
    fetchRcmFromSheets,
    syncGstr2bGovToSheets,
    fetchGstr2bGovFromSheets,
    currentGstr2bGov,
    loadSample,\;
content = content.replace(/syncGstr1ToSheets,\r?\n\s*loadSample,/, exportsBlock);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Fixed AppContext.tsx successfully');
