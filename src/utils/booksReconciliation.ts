export function normalize(inv: string): string {
  if (!inv) return '';
  return String(inv).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function normalizeGstin(gstin: string): string {
  if (!gstin) return '';
  return String(gstin).trim().toUpperCase().replace(/\s+/g, '');
}

export function runBooksReconciliation(
  books: any[] = [],
  currentGstr2b: any[] = [],
  allMonthsGstr2b: any[] = [],
  tolerance: number = 1,
  normalizeInvoice: boolean = true
) {
  const reconRows: any[] = [];
  const statusCounts: Record<string, number> = {};
  const matched2bStatus = new Map<string, string>();
  const usedCurrent2b = new Set<string>();
  const usedAllMonths2b = new Set<string>();

  const getInvKey = (inv: string) => normalizeInvoice ? normalize(inv) : String(inv || '').trim().toUpperCase();

  const isAmountMatch = (b: any, g: any) => {
    const diffTaxable = Math.abs((Number(b.taxable) || 0) - (Number(g.taxable) || 0));
    const diffIgst = Math.abs((Number(b.igst) || 0) - (Number(g.igst) || 0));
    const diffCgst = Math.abs((Number(b.cgst) || 0) - (Number(g.cgst) || 0));
    const diffSgst = Math.abs((Number(b.sgst) || 0) - (Number(g.sgst) || 0));
    const diffCess = Math.abs((Number(b.cess) || 0) - (Number(g.cess) || 0));
    return diffTaxable <= tolerance && diffIgst <= tolerance && diffCgst <= tolerance && diffSgst <= tolerance && diffCess <= tolerance;
  };

  const getMismatches = (b: any, g: any, foundByGstinAmount: boolean, foundByInvOnly: boolean) => {
    const mismatches: string[] = [];
    if (foundByGstinAmount) {
      mismatches.push('Invoice No. Not Match');
    }
    if (foundByInvOnly || (normalizeGstin(b.gstin) !== normalizeGstin(g.gstin))) {
      mismatches.push('GST No. Not Match');
    }
    if (Math.abs((Number(b.taxable) || 0) - (Number(g.taxable) || 0)) > tolerance) {
      mismatches.push('Taxable Not Match');
    }
    if (Math.abs((Number(b.igst) || 0) - (Number(g.igst) || 0)) > tolerance) {
      mismatches.push('IGST Not Match');
    }
    if (Math.abs((Number(b.cgst) || 0) - (Number(g.cgst) || 0)) > tolerance) {
      mismatches.push('CGST Not Match');
    }
    if (Math.abs((Number(b.sgst) || 0) - (Number(g.sgst) || 0)) > tolerance) {
      mismatches.push('SGST Not Match');
    }
    if (Math.abs((Number(b.cess) || 0) - (Number(g.cess) || 0)) > tolerance) {
      mismatches.push('Cess Not Match');
    }
    return mismatches;
  };

  // Process Books rows
  books.forEach(b => {
    const bTaxable = Number(b.taxable) || 0;
    const bIgst = Number(b.igst) || 0;
    const bCgst = Number(b.cgst) || 0;
    const bSgst = Number(b.sgst) || 0;
    const bCess = Number(b.cess) || 0;
    const bTax = bIgst + bCgst + bSgst + bCess;

    const isDebitNote = bTaxable < 0 || 
      bTax < 0 ||
      String(b.type || '').toLowerCase().includes('debit') || 
      String(b.voucherType || '').toLowerCase().includes('debit') ||
      String(b.invoiceType || '').toLowerCase().includes('debit') ||
      String(b.docType || '').toLowerCase().includes('debit');

    if (isDebitNote) {
      const status = 'Reversal ITC';
      reconRows.push({
        ...b,
        type: 'Debit Note',
        recoStatus: status,
        reconData: {
          bRowId: b.id,
          g2bId: null,
          g2bAllId: null,
          booksTaxable: bTaxable,
          booksIgst: bIgst,
          booksCgst: bCgst,
          booksSgst: bSgst,
          booksCess: bCess,
          booksTax: bTax,
          g2bTaxable: null,
          g2bIgst: null,
          g2bCgst: null,
          g2bSgst: null,
          g2bCess: null,
          g2bTax: null,
          supplierName: b.supplierName,
          gstin: b.gstin,
          invoiceNo: b.invoiceNo,
          invoiceDate: b.invoiceDate || b.date,
          status
        }
      });
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      return;
    }

    const bKey = getInvKey(b.invoiceNo);
    const bGstin = normalizeGstin(b.gstin);

    let matchData: any = null;
    let isCurrentMonth = true;
    let foundByGstinAmount = false;
    let foundByInvOnly = false;
    let isExactMatch = false;

    // 1. Exact Match in Current Month 2B (GSTIN + InvoiceNo + Amounts)
    let candidate = currentGstr2b.find(g => 
      !usedCurrent2b.has(g.id) &&
      normalizeGstin(g.gstin) === bGstin &&
      getInvKey(g.invoiceNo) === bKey &&
      isAmountMatch(b, g)
    );
    if (candidate) {
      matchData = candidate;
      isCurrentMonth = true;
      isExactMatch = true;
      usedCurrent2b.add(candidate.id);
    }

    // 2. Exact Match in All Months 2B (GSTIN + InvoiceNo + Amounts)
    if (!matchData) {
      candidate = allMonthsGstr2b.find(g => 
        !usedAllMonths2b.has(g.id) &&
        !usedCurrent2b.has(g.id) &&
        normalizeGstin(g.gstin) === bGstin &&
        getInvKey(g.invoiceNo) === bKey &&
        isAmountMatch(b, g)
      );
      if (candidate) {
        matchData = candidate;
        isCurrentMonth = false;
        isExactMatch = true;
        usedAllMonths2b.add(candidate.id);
      }
    }

    // 3. GSTIN + InvoiceNo Match with Value Mismatch (Current Month first, then All Months)
    if (!matchData) {
      candidate = currentGstr2b.find(g => 
        !usedCurrent2b.has(g.id) &&
        normalizeGstin(g.gstin) === bGstin &&
        getInvKey(g.invoiceNo) === bKey
      );
      if (candidate) {
        matchData = candidate;
        isCurrentMonth = true;
        usedCurrent2b.add(candidate.id);
      } else {
        candidate = allMonthsGstr2b.find(g => 
          !usedAllMonths2b.has(g.id) &&
          !usedCurrent2b.has(g.id) &&
          normalizeGstin(g.gstin) === bGstin &&
          getInvKey(g.invoiceNo) === bKey
        );
        if (candidate) {
          matchData = candidate;
          isCurrentMonth = false;
          usedAllMonths2b.add(candidate.id);
        }
      }
    }

    // 4. GSTIN + Taxable Value Match (Invoice No Mismatch)
    if (!matchData && bGstin) {
      candidate = currentGstr2b.find(g => 
        !usedCurrent2b.has(g.id) &&
        normalizeGstin(g.gstin) === bGstin &&
        Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
      );
      if (candidate) {
        matchData = candidate;
        isCurrentMonth = true;
        foundByGstinAmount = true;
        usedCurrent2b.add(candidate.id);
      } else {
        candidate = allMonthsGstr2b.find(g => 
          !usedAllMonths2b.has(g.id) &&
          !usedCurrent2b.has(g.id) &&
          normalizeGstin(g.gstin) === bGstin &&
          Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
        );
        if (candidate) {
          matchData = candidate;
          isCurrentMonth = false;
          foundByGstinAmount = true;
          usedAllMonths2b.add(candidate.id);
        }
      }
    }

    // 5. Invoice No Match only (GST No Mismatch)
    if (!matchData && bKey) {
      candidate = currentGstr2b.find(g => 
        !usedCurrent2b.has(g.id) &&
        getInvKey(g.invoiceNo) === bKey &&
        Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
      );
      if (candidate) {
        matchData = candidate;
        isCurrentMonth = true;
        foundByInvOnly = true;
        usedCurrent2b.add(candidate.id);
      } else {
        candidate = allMonthsGstr2b.find(g => 
          !usedAllMonths2b.has(g.id) &&
          !usedCurrent2b.has(g.id) &&
          getInvKey(g.invoiceNo) === bKey &&
          Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
        );
        if (candidate) {
          matchData = candidate;
          isCurrentMonth = false;
          foundByInvOnly = true;
          usedAllMonths2b.add(candidate.id);
        }
      }
    }

    // Determine final status
    let status = '';
    if (!matchData) {
      status = 'Not in 2B';
    } else if (isExactMatch) {
      status = `Matched - ${matchData.month || (isCurrentMonth ? 'Current Month' : 'All Months')}`;
      matched2bStatus.set(matchData.id, status);
    } else {
      const mismatches = getMismatches(b, matchData, foundByGstinAmount, foundByInvOnly);
      if (mismatches.length === 0) {
        status = `Matched - ${matchData.month || (isCurrentMonth ? 'Current Month' : 'All Months')}`;
      } else {
        status = mismatches.join(', ');
      }
      matched2bStatus.set(matchData.id, status);
    }

    const gTaxable = matchData ? (Number(matchData.taxable) || 0) : null;
    const gIgst = matchData ? (Number(matchData.igst) || 0) : null;
    const gCgst = matchData ? (Number(matchData.cgst) || 0) : null;
    const gSgst = matchData ? (Number(matchData.sgst) || 0) : null;
    const gCess = matchData ? (Number(matchData.cess) || 0) : null;
    const gTax = matchData ? ((gIgst || 0) + (gCgst || 0) + (gSgst || 0) + (gCess || 0)) : null;

    reconRows.push({
      ...b,
      recoStatus: status,
      reconData: {
        bRowId: b.id,
        g2bId: isCurrentMonth && matchData ? matchData.id : null,
        g2bAllId: !isCurrentMonth && matchData ? matchData.id : null,
        booksTaxable: bTaxable,
        booksIgst: bIgst,
        booksCgst: bCgst,
        booksSgst: bSgst,
        booksCess: bCess,
        booksTax: bTax,
        g2bTaxable: gTaxable,
        g2bIgst: gIgst,
        g2bCgst: gCgst,
        g2bSgst: gSgst,
        g2bCess: gCess,
        g2bTax: gTax,
        supplierName: matchData ? matchData.supplierName : b.supplierName,
        gstin: matchData ? matchData.gstin : b.gstin,
        invoiceNo: matchData ? matchData.invoiceNo : b.invoiceNo,
        invoiceDate: matchData ? (matchData.invoiceDate || matchData.date) : (b.invoiceDate || b.date),
        status,
        ...(matchData || {})
      }
    });

    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const gstr2bWithStatus = currentGstr2b.map(g => ({
    ...g,
    recoStatus: matched2bStatus.has(g.id) ? matched2bStatus.get(g.id) : 'Not in Book'
  }));

  const allMonthsWithStatus = allMonthsGstr2b.map(g => ({
    ...g,
    recoStatus: matched2bStatus.has(g.id) ? matched2bStatus.get(g.id) : 'Not in Book'
  }));

  return { reconRows, statusCounts, gstr2bWithStatus, allMonthsWithStatus };
}

export function getDashboardReconData(
  books: any[],
  currentGstr2b: any[],
  allMonthsGstr2b: any[],
  tolerance: number = 1,
  normalizeInvoice: boolean = true
) {
  const { reconRows, gstr2bWithStatus } = runBooksReconciliation(
    books,
    currentGstr2b,
    allMonthsGstr2b,
    tolerance,
    normalizeInvoice
  );

  const taxTotal = (r: any) => (Number(r.igst) || 0) + (Number(r.cgst) || 0) + (Number(r.sgst) || 0) + (Number(r.cess) || 0);

  const mappedBooks = reconRows.map(b => {
    const rd = b.reconData;
    const has2b = !!(rd?.g2bId || rd?.g2bAllId);
    const bTax = taxTotal(b);
    const gTax = has2b ? ((Number(rd.g2bIgst) || 0) + (Number(rd.g2bCgst) || 0) + (Number(rd.g2bSgst) || 0) + (Number(rd.g2bCess) || 0)) : 0;

    return {
      id: b.id,
      status: b.recoStatus,
      invoiceNo: b.invoiceNo,
      invoiceDate: b.invoiceDate || b.date,
      gstin: b.gstin,
      supplierName: b.supplierName,
      booksTaxable: Number(b.taxable) || 0,
      g2bTaxable: has2b ? (Number(rd.g2bTaxable) || 0) : 0,
      booksTax: bTax,
      g2bTax: gTax,
      diffTax: bTax - gTax,
      booksIgst: Number(b.igst) || 0,
      booksCgst: Number(b.cgst) || 0,
      booksSgst: Number(b.sgst) || 0,
      booksCess: Number(b.cess) || 0,
      g2bIgst: has2b ? (Number(rd.g2bIgst) || 0) : 0,
      g2bCgst: has2b ? (Number(rd.g2bCgst) || 0) : 0,
      g2bSgst: has2b ? (Number(rd.g2bSgst) || 0) : 0,
      g2bCess: has2b ? (Number(rd.g2bCess) || 0) : 0,
      diffIgst: (Number(b.igst) || 0) - (has2b ? (Number(rd.g2bIgst) || 0) : 0),
      diffCgst: (Number(b.cgst) || 0) - (has2b ? (Number(rd.g2bCgst) || 0) : 0),
      diffSgst: (Number(b.sgst) || 0) - (has2b ? (Number(rd.g2bSgst) || 0) : 0),
      diffCess: (Number(b.cess) || 0) - (has2b ? (Number(rd.g2bCess) || 0) : 0),
      remark: b.recoStatus
    };
  });

  const notInBooks = gstr2bWithStatus
    .filter(g => g.recoStatus === 'Not in Book')
    .map(g => {
      const gTax = taxTotal(g);
      return {
        id: g.id,
        status: 'Not in Books',
        invoiceNo: g.invoiceNo,
        invoiceDate: g.invoiceDate || g.date,
        gstin: g.gstin,
        supplierName: g.supplierName,
        booksTaxable: 0,
        g2bTaxable: Number(g.taxable) || 0,
        booksTax: 0,
        g2bTax: gTax,
        diffTax: -gTax,
        booksIgst: 0,
        booksCgst: 0,
        booksSgst: 0,
        booksCess: 0,
        g2bIgst: Number(g.igst) || 0,
        g2bCgst: Number(g.cgst) || 0,
        g2bSgst: Number(g.sgst) || 0,
        g2bCess: Number(g.cess) || 0,
        diffIgst: -(Number(g.igst) || 0),
        diffCgst: -(Number(g.cgst) || 0),
        diffSgst: -(Number(g.sgst) || 0),
        diffCess: -(Number(g.cess) || 0),
        remark: 'Missing in Books'
      };
    });

  return [...mappedBooks, ...notInBooks];
}
