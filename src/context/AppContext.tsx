// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData, defaultState, FY_LIST, MONTHS, todayFY } from '../utils/storage';
import { getSampleData } from '../data/sampleData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState(loadData());

  useEffect(() => {
    saveData(state);
    const theme = state.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [state]);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  const currentBooks = state.books.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentGstr2bGov = (state.gstr2b_gov || []).filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentGstr2b = (state.gstr2b || []).filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentRcm = state.rcm.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentGstr1 = state.gstr1.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const fyGstr2b = state.gstr2b.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear
  );

  const fyGstr1 = state.gstr1.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear
  );

  const activeCompany = state.companies.find((c) => c.id === state.activeCompanyId) || state.companies[0];
  
  const outputGstKey = `${state.activeCompanyId}|${state.financialYear}|${state.month}`;
  const currentOutputGst = state.outputGst[outputGstKey] || { igst: 0, cgst: 0, sgst: 0, cess: 0 };

  const saveOutputGst = (vals) => {
    updateState({
      outputGst: {
        ...state.outputGst,
        [outputGstKey]: vals,
      }
    });
  };

  const clearCurrentPeriod = (type) => {
    const storeKey = type === 'g2b_gov' ? 'gstr2b_gov' : type;
    if (!state[storeKey]) return;
    const newData = state[storeKey].filter(
      (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
    );
    
    let updates = { [storeKey]: newData };
    
    if (type === 'g2b_gov') {
      const newGstr2b = (state.gstr2b || []).filter(
        (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
      );
      updates['gstr2b'] = newGstr2b;
    }
    
    updateState(updates);
    
    if (type === 'gstr1' && typeof syncGstr1ToSheets === 'function') syncGstr1ToSheets(newData);
    if (type === 'books' && typeof syncBooksToSheets === 'function') syncBooksToSheets(newData);
    if (type === 'g2b_gov') {
      if (typeof syncGstr2bGovToSheets === 'function') syncGstr2bGovToSheets(newData);
      if (typeof syncGstr2bToSheets === 'function') syncGstr2bToSheets(updates['gstr2b']);
    }
    if (type === 'gstr2b') {
      if (typeof syncGstr2bToSheets === 'function') syncGstr2bToSheets(newData);
    }
  };

  const loadSample = () => {
    const co = state.activeCompanyId;
    const fy = state.financialYear;
    const mo = state.month;
    
    let newBooks = state.books.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));
    let newGstr2b = state.gstr2b.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));
    let newRcm = state.rcm.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));
    let newGstr1 = state.gstr1.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));

    const sample = getSampleData(co, fy, mo);
    
    updateState({
      books: [...newBooks, ...sample.books],
      gstr2b: [...newGstr2b, ...sample.g2b],
      rcm: [...newRcm, ...sample.rcm],
      gstr1: [...newGstr1, ...(sample.gstr1 || [])]
    });
  };

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDt5t_rYT0ERzntmc41E0OSW4wkdmgZu55SAWmKX-eOkTWhRcK7GmMZnGoC57zLwen/exec";

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
              dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
              dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
            igst: Number(r["igst"] || r["Integrated Tax (₹)"]) || 0,
            cgst: Number(r["cgst"] || r["Central Tax (₹)"]) || 0,
            sgst: Number(r["sgst"] || r["State Tax (₹)"]) || 0,
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
              dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
              dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
            taxable: Number(r["taxable"] || r["Taxable Value (₹)"]) || 0,
            igst: Number(r["igst"] || r["IGST (₹)"]) || 0,
            cgst: Number(r["cgst"] || r["CGST (₹)"]) || 0,
            sgst: Number(r["sgst"] || r["SGST (₹)"]) || 0,
            cess: Number(r["cess"] || r["CESS (₹)"]) || 0,
            remark: r["remark"] || r["Remark"] || ""
          };
        });
        updateState({ gstr2b_gov: mappedData });
      }
    } catch (e) {
      console.error('Failed to fetch 2B GOV:', e);
    }
  };

  const fetchGstr2bFromSheets = async () => {
    try {
      const res = await fetch(SCRIPT_URL + '?type=gstr2b');
      const sheetData = await res.json();
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => {
          let dStr = r["invoiceDate"] || r["Date"] || "";
          if (dStr && dStr.includes("T") && dStr.endsWith("Z")) {
            const d = new Date(dStr);
            if (!isNaN(d.getTime())) {
              dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
            taxable: Number(r["taxable"] || r["Taxable Value"]) || Number(r["Taxable Value (\u20b9)"]) || 0,
            igst: Number(r["igst"] || r["IGST"]) || Number(r["IGST (\u20b9)"]) || 0,
            cgst: Number(r["cgst"] || r["CGST"]) || Number(r["CGST (\u20b9)"]) || 0,
            sgst: Number(r["sgst"] || r["SGST"]) || Number(r["SGST (\u20b9)"]) || 0,
            cess: Number(r["cess"] || r["CESS"]) || Number(r["CESS (\u20b9)"]) || 0,
            remark: r["remark"] || r["Remark"] || ""
          };
        });
        
        // Ensure that if a specific month was explicitly cleared locally in gstr2b_gov,
        // it doesn't resurrect from the remote gstr2b sheet due to sync failure.
        // A simple way: find all (fy, month) in mappedData. If that (fy, month) has 0 rows in state.gstr2b_gov,
        // we assume it was cleared, but only if we know it was cleared.
        // Since we can't be perfectly sure, maybe it's better to just use the mappedData directly, 
        // but if the current selected period is empty in gstr2b_gov, remove it from mappedData too.
        const currentGov = (state.gstr2b_gov || []).filter(
          (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
        );
        let finalData = mappedData;
        if (currentGov.length === 0) {
          finalData = finalData.filter(
            (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
          );
        }
        
        updateState({ gstr2b: finalData });
      }
    } catch (e) {
      console.error('Failed to fetch 2B All Months:', e);
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

  const syncGstr2bToSheets = async (dataToSync, action = "SYNC_ALL") => {
    try {
      let payload = { action, type: 'gstr2b', data: dataToSync };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync 2B All Months:', e);
    }
  };


  const deleteRow = (type, rowId) => {
    const newData = state[type].filter(r => r.id !== rowId);
    updateState({ [type]: newData });
    if (type === 'gstr1') syncGstr1ToSheets(newData);
  };

  const updateRow = (type, rowId, newDataObj) => {
    const newData = state[type].map(r => r.id === rowId ? { ...r, ...newDataObj } : r);
    updateState({ [type]: newData });
    if (type === 'gstr1') syncGstr1ToSheets(newData);
  };

  const resolutions = state.resolutions || {};

  const resolveMismatch = (id, res) => {
    updateState({
      resolutions: {
        ...resolutions,
        [id]: { ...res, timestamp: Date.now() }
      }
    });
  };

  const undoResolve = (id) => {
    const copy = { ...resolutions };
    delete copy[id];
    updateState({ resolutions: copy });
  };

  const clearAllData = () => {
    setState(defaultState());
  };

  const toggleTheme = () => {
    const order = ['dark', 'light', 'blue'];
    const idx = order.indexOf(state.settings.theme);
    updateSettings({ theme: order[(idx + 1) % order.length] || 'light' });
  };

  const getLockKey = (type) => `${state.activeCompanyId}|${state.financialYear}|${state.month}|${type}`;
  const checkIsLocked = (type) => !!(state.locked && state.locked[getLockKey(type)]);
  const toggleLock = (type) => {
    const key = getLockKey(type);
    const locked = state.locked || {};
    updateState({ locked: { ...locked, [key]: !locked[key] } });
  };

  const contextValue = {
    ...state,
    updateState,
    updateSettings,
    currentBooks,
    currentGstr2b,
    currentRcm,
    currentGstr1,
    fyGstr2b,
    fyGstr1,
    activeCompany,
    currentOutputGst,
    saveOutputGst,
    clearCurrentPeriod,
    deleteRow,
    updateRow,
    syncGstr1ToSheets,
    fetchGstr1FromSheets,
    syncBooksToSheets,
    fetchBooksFromSheets,
    syncRcmToSheets,
    fetchRcmFromSheets,
    syncGstr2bGovToSheets,
    fetchGstr2bGovFromSheets,
    syncGstr2bToSheets,
    fetchGstr2bFromSheets,
    currentGstr2bGov,
    loadSample,
    clearAllData,
    toggleTheme,
    resolutions,
    resolveMismatch,
    undoResolve,
    FY_LIST,
    MONTHS,
    checkIsLocked,
    toggleLock
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
