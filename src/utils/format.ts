export function fmtINR(n){
  n = Number(n)||0;
  const neg = n < 0; n = Math.abs(n);
  let s = n.toFixed(0);
  let last3 = s.length > 3 ? s.slice(-3) : s;
  let rest = s.length > 3 ? s.slice(0, -3) : '';
  if(rest !== '') last3 = ',' + last3;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg?'-':'') + '₹ ' + rest + last3;
}

export function fmtNum(n){ return Number(n||0).toLocaleString('en-IN'); }

export function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export function parseNum(v){ const n = parseFloat(String(v).replace(/,/g,'')); return isNaN(n) ? 0 : n; }

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(raw: any): string {
  if (raw === undefined || raw === null || raw === '') return '-';
  const str = String(raw).trim();
  if (!str) return '-';

  // 1. Excel serial date (e.g. 40000 to 60000)
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    const dateObj = new Date((serial - 25569) * 86400 * 1000);
    if (!isNaN(dateObj.getTime())) {
      const d = String(dateObj.getUTCDate()).padStart(2, '0');
      const m = MONTH_NAMES[dateObj.getUTCMonth()];
      const y = dateObj.getUTCFullYear();
      return `${d} ${m} ${y}`;
    }
  }

  // 2. ISO or YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const mIdx = parseInt(isoMatch[2], 10) - 1;
    const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
    if (mIdx >= 0 && mIdx < 12) {
      return `${d} ${MONTH_NAMES[mIdx]} ${y}`;
    }
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
    const mIdx = parseInt(dmyMatch[2], 10) - 1;
    const y = dmyMatch[3];
    if (mIdx >= 0 && mIdx < 12) {
      return `${d} ${MONTH_NAMES[mIdx]} ${y}`;
    }
  }

  // 4. Already written as 26 Apr 2026 or 26-Apr-2026
  const textMatch = str.match(/^(\d{1,2})[\s\-]+([A-Za-z]{3,9})[\s\-]+(\d{4})/);
  if (textMatch) {
    const d = String(parseInt(textMatch[1], 10)).padStart(2, '0');
    const mRaw = textMatch[2];
    const m = mRaw.slice(0, 3).charAt(0).toUpperCase() + mRaw.slice(1, 3).toLowerCase();
    const y = textMatch[3];
    return `${d} ${m} ${y}`;
  }

  // 5. General Date parse
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const d = String(dt.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[dt.getMonth()];
    const y = dt.getFullYear();
    return `${d} ${m} ${y}`;
  }

  return str;
}

export function formatDateParts(raw: any): { day: string; month: string; year: string; full: string } {
  const formatted = formatDate(raw);
  if (formatted === '-') return { day: '--', month: '---', year: '----', full: '-' };
  const parts = formatted.split(' ');
  if (parts.length === 3) {
    return { day: parts[0], month: parts[1], year: parts[2], full: formatted };
  }
  return { day: formatted.slice(0, 2), month: formatted.slice(3, 6) || '', year: formatted.slice(7) || '', full: formatted };
}

