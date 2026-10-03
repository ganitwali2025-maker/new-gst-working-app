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

  const currentGstr2b = state.gstr2b.filter(
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
    updateState({
      [type]: state[type].filter(
        (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
      ),
    });
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

  const SCRIPT_URL = state.settings?.scriptUrl || "https://script.google.com/macros/s/AKfycbzPN-BdSxYQ_QHA1JazBwYXUXSt8d505s2HknrX65VFEfRWii7McdYn_nquTSk2ipoz/exec";

  const syncGstr1ToSheets = (gstr1Data) => {
    // Sync all data for current active company so multiple months are saved
    const companyData = gstr1Data.filter(r => r.companyId === state.activeCompanyId);
    console.log('syncGstr1ToSheets called with', gstr1Data.length, 'rows. Filtered by companyId (', state.activeCompanyId, '):', companyData.length, 'rows.');
    
    const dataToSync = companyData.map(r => {
      const taxable = Number(r.taxable) || 0;
      const igst = Number(r.igst) || 0;
      const cgst = Number(r.cgst) || 0;
      const sgst = Number(r.sgst) || 0;
      const cess = Number(r.cess) || 0;
      const totalTax = igst + cgst + sgst + cess;
      return {
        id: r.id || "",
        month: r.month || state.month,
        quarter: r.quarter || "",
        fy: r.fy || state.financialYear,
        invoiceDate: r.invoiceDate || "",
        supplierName: r.supplierName || "",
        gstin: r.gstin || "",
        invoiceNo: r.invoiceNo || "",
        taxable, igst, cgst, sgst, totalTax,
        totalInvoiceValue: taxable + totalTax
      };
    });

    console.log("Mock syncing to sheets:", dataToSync);
    // Removed external fetch to SCRIPT_URL to keep it frontend-only.
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
