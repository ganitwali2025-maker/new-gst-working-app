export function normalize(inv: string): string {
  if (!inv) return '';
  return String(inv).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function runBooksReconciliation(
  books: any[],
  currentGstr2b: any[],
  allMonthsGstr2b: any[],
  tolerance: number = 1,
  normalizeInvoice: boolean = true
) {
  const reconRows: any[] = [];
  const statusCounts: Record<string, number> = {};
  const matched2bStatus = new Map<string, string>();

  // Create lookup maps for 2B
  const current2bMap = new Map<string, any[]>();
  currentGstr2b.forEach(g => {
    const key = normalizeInvoice ? normalize(g.invoiceNo) : String(g.invoiceNo || '').trim().toUpperCase();
    if (!current2bMap.has(key)) current2bMap.set(key, []);
    current2bMap.get(key)!.push(g);
  });

  const allMonths2bMap = new Map<string, any[]>();
  allMonthsGstr2b.forEach(g => {
    const key = normalizeInvoice ? normalize(g.invoiceNo) : String(g.invoiceNo || '').trim().toUpperCase();
    if (!allMonths2bMap.has(key)) allMonths2bMap.set(key, []);
    allMonths2bMap.get(key)!.push(g);
  });

  books.forEach(b => {
    const bTaxableForCheck = Number(b.taxable) || 0;
    if (bTaxableForCheck < 0) {
      const status = 'Reversal ITC';
      reconRows.push({
        ...b,
        type: 'Debit Note',
        recoStatus: status,
        reconData: { bRowId: b.id, g2bId: null, g2bAllId: null }
      });
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      return;
    }

    const key = normalizeInvoice ? normalize(b.invoiceNo) : String(b.invoiceNo || '').trim().toUpperCase();
    
    let candidates = current2bMap.get(key) || [];
    let isCurrentMonth = true;

    if (candidates.length === 0) {
      candidates = allMonths2bMap.get(key) || [];
      isCurrentMonth = false;
    }

    let status = '';
    let matchData = null;
    let foundByGstinAmount = false;

    // If still no candidates by invoice no, try matching by GSTIN + Taxable
    if (candidates.length === 0) {
      const bTaxable = Number(b.taxable) || 0;
      const bGstin = String(b.gstin || '').trim().toUpperCase();
      
      let altMatch = currentGstr2b.find(g => 
        String(g.gstin || '').trim().toUpperCase() === bGstin && 
        Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
      );
      
      if (altMatch) {
        candidates = [altMatch];
        isCurrentMonth = true;
        foundByGstinAmount = true;
      } else {
        altMatch = allMonthsGstr2b.find(g => 
          String(g.gstin || '').trim().toUpperCase() === bGstin && 
          Math.abs((Number(g.taxable) || 0) - bTaxable) <= tolerance
        );
        if (altMatch) {
          candidates = [altMatch];
          isCurrentMonth = false;
          foundByGstinAmount = true;
        }
      }
    }

    if (candidates.length === 0) {
      status = 'Not in 2B';
    } else {
      // Find the best candidate (prefer matching GSTIN)
      let bestCandidate = candidates.find(c => c.gstin === b.gstin) || candidates[0];
      matchData = bestCandidate;

      const mismatches: string[] = [];
      if (foundByGstinAmount) {
        mismatches.push('Invoice No. Not Match');
      }
      
      if (String(b.gstin || '').trim().toUpperCase() !== String(bestCandidate.gstin || '').trim().toUpperCase()) {
        mismatches.push('GST No. Not Match');
      }

      if (Math.abs((Number(b.taxable) || 0) - (Number(bestCandidate.taxable) || 0)) > tolerance) {
        mismatches.push('Taxable Not Match');
      }
      if (Math.abs((Number(b.igst) || 0) - (Number(bestCandidate.igst) || 0)) > tolerance) {
        mismatches.push('IGST Not Match');
      }
      if (Math.abs((Number(b.cgst) || 0) - (Number(bestCandidate.cgst) || 0)) > tolerance) {
        mismatches.push('CGST Not Match');
      }
      if (Math.abs((Number(b.sgst) || 0) - (Number(bestCandidate.sgst) || 0)) > tolerance) {
        mismatches.push('SGST Not Match');
      }
      if (Math.abs((Number(b.cess) || 0) - (Number(bestCandidate.cess) || 0)) > tolerance) {
        mismatches.push('Cess Not Match');
      }

      if (mismatches.length === 0) {
        status = `Matched - ${bestCandidate.month || (isCurrentMonth ? 'Current Month' : 'All Months')}`;
      } else {
        status = mismatches.join(', ');
      }
      matched2bStatus.set(bestCandidate.id, status);
    }

    reconRows.push({
      ...b,
      recoStatus: status,
      reconData: {
        bRowId: b.id,
        g2bId: isCurrentMonth ? matchData?.id : null,
        g2bAllId: !isCurrentMonth ? matchData?.id : null,
        ...matchData
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

export function getDashboardReconData(books: any[], currentGstr2b: any[], allMonthsGstr2b: any[], tolerance: number, normalizeInvoice: boolean) {
  const { reconRows, gstr2bWithStatus } = runBooksReconciliation(books, currentGstr2b, allMonthsGstr2b, tolerance, normalizeInvoice);
  
  const taxTotal = (r: any) => (Number(r.igst) || 0) + (Number(r.cgst) || 0) + (Number(r.sgst) || 0) + (Number(r.cess) || 0);

  const mappedBooks = reconRows.map(b => {
    const g = b.reconData?.g2bId ? b.reconData : (b.reconData?.g2bAllId ? b.reconData : null);
    const bTax = taxTotal(b);
    const gTax = g ? taxTotal(g) : 0;
    
    return {
      id: b.id,
      status: b.recoStatus,
      invoiceNo: b.invoiceNo,
      invoiceDate: b.date || b.invoiceDate,
      gstin: b.gstin,
      supplierName: b.supplierName,
      booksTaxable: Number(b.taxable) || 0,
      g2bTaxable: g ? (Number(g.taxable) || 0) : 0,
      booksTax: bTax,
      g2bTax: gTax,
      diffTax: bTax - gTax,
      booksIgst: Number(b.igst)||0, booksCgst: Number(b.cgst)||0, booksSgst: Number(b.sgst)||0, booksCess: Number(b.cess)||0,
      diffIgst: (Number(b.igst)||0) - (g ? Number(g.igst)||0 : 0),
      diffCgst: (Number(b.cgst)||0) - (g ? Number(g.cgst)||0 : 0),
      diffSgst: (Number(b.sgst)||0) - (g ? Number(g.sgst)||0 : 0),
      diffCess: (Number(b.cess)||0) - (g ? Number(g.cess)||0 : 0),
      remark: b.recoStatus
    };
  });

  const notInBooks = gstr2bWithStatus.filter(g => g.recoStatus === 'Not in Book').map(g => {
    const gTax = taxTotal(g);
    return {
      id: g.id,
      status: 'Not in Books',
      invoiceNo: g.invoiceNo,
      invoiceDate: g.date || g.invoiceDate,
      gstin: g.gstin,
      supplierName: g.supplierName,
      booksTaxable: 0,
      g2bTaxable: Number(g.taxable) || 0,
      booksTax: 0,
      g2bTax: gTax,
      diffTax: -gTax,
      booksIgst: 0, booksCgst: 0, booksSgst: 0, booksCess: 0,
      diffIgst: -(Number(g.igst)||0),
      diffCgst: -(Number(g.cgst)||0),
      diffSgst: -(Number(g.sgst)||0),
      diffCess: -(Number(g.cess)||0),
      remark: 'Missing in Books'
    };
  });

  return [...mappedBooks, ...notInBooks];
}
