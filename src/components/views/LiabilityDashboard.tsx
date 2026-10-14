import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, IndianRupee, MapPin, Landmark, FileText, 
  Activity, AlertCircle, CheckCircle, Info, PieChart, ShieldCheck, 
  ArrowRightLeft, ArrowUpRight, Coins, ChevronRight, Eye, Search, 
  Filter, Upload, Calendar, Building2, ShoppingBag, ArrowRight, ExternalLink,
  Layers, Check, Copy
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { fmtINR, fmtNum, formatDate, formatDateParts } from '../../utils/format';
import InvoiceViewModal from '../common/InvoiceViewModal';

const GST_STATE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa', '32': 'Kerala',
  '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh'
};

function resolvePOS(r: any): string {
  if (r.pos && String(r.pos).trim()) {
    const p = String(r.pos).trim();
    if (GST_STATE_MAP[p]) return `${p} - ${GST_STATE_MAP[p]}`;
    return p;
  }
  if (r.gstin && String(r.gstin).length >= 2) {
    const code = String(r.gstin).slice(0, 2);
    if (GST_STATE_MAP[code]) return `${code} - ${GST_STATE_MAP[code]}`;
  }
  return '23 - Madhya Pradesh';
}

function parseDateForSort(dateStr: any): number {
  if (!dateStr) return 0;
  const str = String(dateStr).trim();
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    return (serial - 25569) * 86400 * 1000;
  }
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10)).getTime();
  }
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    return new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10)).getTime();
  }
  const t = new Date(str).getTime();
  return isNaN(t) ? 0 : t;
}

const DEFAULT_SAMPLE_INVOICES = [
  {
    invoiceNo: 'INV-2026-0142',
    invoiceDate: '2026-05-12T10:30:00.000Z',
    customerName: 'Tata Steel Processing & Distribution Ltd',
    gstin: '27AAACT2727Q1ZB',
    pos: '27 - Maharashtra',
    taxable: 485000,
    igst: 87300,
    cgst: 0,
    sgst: 0,
    cess: 0,
    description: 'Refractory Minerals & Calcined Bauxite',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0139',
    invoiceDate: '2026-05-10T14:15:00.000Z',
    customerName: 'Jindal Steel & Power Ltd',
    gstin: '22AAACJ4422K1Z9',
    pos: '22 - Chhattisgarh',
    taxable: 362000,
    igst: 65160,
    cgst: 0,
    sgst: 0,
    cess: 0,
    description: 'High Alumina Fire Clay Bricks',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0135',
    invoiceDate: '2026-05-08T11:00:00.000Z',
    customerName: 'Madhya Pradesh Ceramic Works',
    gstin: '23AABCM8899D1ZT',
    pos: '23 - Madhya Pradesh',
    taxable: 290000,
    igst: 0,
    cgst: 26100,
    sgst: 26100,
    cess: 0,
    description: 'Industrial Minerals Assorted',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0131',
    invoiceDate: '2026-05-06T16:45:00.000Z',
    customerName: 'Electrosteel Castings Ltd',
    gstin: '19AAACE1828L1ZM',
    pos: '19 - West Bengal',
    taxable: 215000,
    igst: 38700,
    cgst: 0,
    sgst: 0,
    cess: 0,
    description: 'Castable Refractory Granules',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0128',
    invoiceDate: '2026-05-05T09:20:00.000Z',
    customerName: 'Retail Counter Cash Sales',
    gstin: '',
    pos: '23 - Madhya Pradesh',
    taxable: 145000,
    igst: 0,
    cgst: 13050,
    sgst: 13050,
    cess: 0,
    description: 'Direct Counter Consumer Supply',
    supplyType: 'B2C'
  },
  {
    invoiceNo: 'INV-2026-0124',
    invoiceDate: '2026-05-03T15:10:00.000Z',
    customerName: 'Mahakaushal Iron & Steel Pvt Ltd',
    gstin: '23AAECM5511M1Z3',
    pos: '23 - Madhya Pradesh',
    taxable: 420000,
    igst: 0,
    cgst: 37800,
    sgst: 37800,
    cess: 0,
    description: 'Calcined Kaolin & Raw Minerals',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0120',
    invoiceDate: '2026-05-02T13:30:00.000Z',
    customerName: 'Gujarat Guardian Glass Works',
    gstin: '24AAACG3311P1ZW',
    pos: '24 - Gujarat',
    taxable: 180000,
    igst: 32400,
    cgst: 0,
    sgst: 0,
    cess: 0,
    description: 'Silica Powder & High Grade Flux',
    supplyType: 'B2B'
  },
  {
    invoiceNo: 'INV-2026-0118',
    invoiceDate: '2026-04-29T10:00:00.000Z',
    customerName: 'Local Construction Supplies',
    gstin: '',
    pos: '23 - Madhya Pradesh',
    taxable: 95000,
    igst: 0,
    cgst: 8550,
    sgst: 8550,
    cess: 0,
    description: 'Construction Minerals Batch A',
    supplyType: 'B2C'
  }
];

export default function Liability() {
  const navigate = useNavigate();
  const { currentGstr1 = [], fyGstr1 = [], financialYear, month, activeCompany } = useAppContext() as any;

  // Selected invoice for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'b2b' | 'b2c' | 'inter'>('all');

  // Determine whether to use real data or preview fallback
  const hasRealData = (currentGstr1 && currentGstr1.length > 0) || (fyGstr1 && fyGstr1.length > 0);
  const activeSales = useMemo(() => {
    if (currentGstr1 && currentGstr1.length > 0) return currentGstr1;
    if (fyGstr1 && fyGstr1.length > 0) return fyGstr1;
    return DEFAULT_SAMPLE_INVOICES;
  }, [currentGstr1, fyGstr1]);

  // Basic Calculations
  const mTotalTaxable = activeSales.reduce((a: number, r: any) => a + (Number(r.taxable) || 0), 0);
  const mTotalIgst = activeSales.reduce((a: number, r: any) => a + (Number(r.igst) || 0), 0);
  const mTotalCgst = activeSales.reduce((a: number, r: any) => a + (Number(r.cgst) || 0), 0);
  const mTotalSgst = activeSales.reduce((a: number, r: any) => a + (Number(r.sgst) || 0), 0);
  const mTotalCess = activeSales.reduce((a: number, r: any) => a + (Number(r.cess) || 0), 0);
  const mOutput = mTotalIgst + mTotalCgst + mTotalSgst + mTotalCess;

  // GST Breakdown for Donut
  const gstCompData = [
    { name: 'CGST', value: mTotalCgst, color: '#10b981' },
    { name: 'SGST', value: mTotalSgst, color: '#3b82f6' },
    { name: 'IGST', value: mTotalIgst, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // B2B vs B2C Split
  const b2bInvoices = activeSales.filter((r: any) => {
    const g = String(r.gstin || '').trim();
    return g.length >= 15 && String(r.customerName || r.supplierName || '').toLowerCase() !== 'retail counter cash sales';
  });
  const b2bTotal = b2bInvoices.reduce((a: number, r: any) => a + (Number(r.taxable) || 0), 0);
  const b2cTotal = Math.max(0, mTotalTaxable - b2bTotal);

  const salesSplitData = [
    { name: 'B2B Registered', value: b2bTotal, color: '#3b82f6', count: b2bInvoices.length },
    { name: 'B2C Consumer', value: b2cTotal, color: '#f59e0b', count: activeSales.length - b2bInvoices.length },
  ].filter(d => d.value > 0);

  // Top 5 Inter-State
  const interStateSales = activeSales.filter((r: any) => (Number(r.igst) || 0) > 0);
  const interGrouped = interStateSales.reduce((acc: any, r: any) => {
    const key = resolvePOS(r);
    if (!acc[key]) acc[key] = { pos: key, taxable: 0, igst: 0, count: 0 };
    acc[key].taxable += (Number(r.taxable) || 0);
    acc[key].igst += (Number(r.igst) || 0);
    acc[key].count += 1;
    return acc;
  }, {});
  const top5Inter = (Object.values(interGrouped) as any[]).sort((a: any, b: any) => b.igst - a.igst).slice(0, 5);
  const maxInterIgst = top5Inter.length > 0 ? top5Inter[0].igst : 1;

  // Top 5 Intra-State
  const intraStateSales = activeSales.filter((r: any) => (Number(r.igst) || 0) === 0 && ((Number(r.cgst) || 0) > 0 || (Number(r.sgst) || 0) > 0));
  const intraGrouped = intraStateSales.reduce((acc: any, r: any) => {
    const partyName = r.customerName || r.partyName || r.party || r.supplierName || 'Retail Customer';
    if (!acc[partyName]) acc[partyName] = { party: partyName, taxable: 0, count: 0, item: r.description || 'Assorted Goods / Minerals', gstin: r.gstin || '' };
    acc[partyName].taxable += (Number(r.taxable) || 0);
    acc[partyName].count += 1;
    return acc;
  }, {});
  const top5Intra = (Object.values(intraGrouped) as any[]).sort((a: any, b: any) => b.taxable - a.taxable).slice(0, 5);

  // Normalized Recent Sales with clean dates & sorting
  const normalizedSales = useMemo(() => {
    return activeSales.map((r: any) => {
      const party = r.customerName || r.partyName || r.party || r.supplierName || 'Retail Customer';
      const gstin = String(r.gstin || '').trim();
      const isB2B = gstin.length >= 15 && party.toLowerCase() !== 'retail customer';
      const amt = Number(r.taxable) || 0;
      const igst = Number(r.igst) || 0;
      const cgst = Number(r.cgst) || 0;
      const sgst = Number(r.sgst) || 0;
      const cess = Number(r.cess) || 0;
      const totalTax = igst + cgst + sgst + cess;
      const pos = resolvePOS(r);
      const isInter = igst > 0;

      return {
        raw: r,
        id: r.id || r.invoiceNo,
        date: r.invoiceDate || '2026-05-01',
        invoice: r.invoiceNo || 'INV-001',
        party,
        gstin,
        amt,
        igst,
        cgst,
        sgst,
        cess,
        totalTax,
        totalInvoice: amt + totalTax,
        pos,
        isB2B,
        isInter,
        status: isB2B ? 'B2B' : 'B2C',
        sc: isB2B ? 'blue' : 'yellow',
        item: r.description || 'Goods / Supply'
      };
    }).sort((a, b) => parseDateForSort(b.date) - parseDateForSort(a.date));
  }, [activeSales]);

  // Filtered Sales for Recent Table
  const filteredSales = useMemo(() => {
    return normalizedSales.filter((item) => {
      // Tab filter
      if (filterTab === 'b2b' && !item.isB2B) return false;
      if (filterTab === 'b2c' && item.isB2B) return false;
      if (filterTab === 'inter' && !item.isInter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = item.invoice.toLowerCase().includes(q);
        const matchParty = item.party.toLowerCase().includes(q);
        const matchGstin = item.gstin.toLowerCase().includes(q);
        const matchPos = item.pos.toLowerCase().includes(q);
        if (!matchInvoice && !matchParty && !matchGstin && !matchPos) return false;
      }
      return true;
    });
  }, [normalizedSales, filterTab, searchQuery]);

  const renderCustomDonut = (data: any[], totalLabel: string, totalValue: string) => {
    const total = data.reduce((a: any, b: any) => a + b.value, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', padding: '10px 0' }}>
        <div className="od-donut-wrap" style={{ width: '150px', height: '150px', flex: 'none', position: 'relative' }}>
          <RechartsPieChart width={150} height={150}>
            <Pie
              data={data.length > 0 ? data : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
              innerRadius={52}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cx="50%"
              cy="50%"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPieChart>
          <div className="od-donut-inner" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div className="od-donut-val" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg)' }}>{totalValue}</div>
            <div className="od-donut-lbl" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{totalLabel}</div>
          </div>
        </div>
        <div className="od-legend" style={{ marginLeft: 0, width: '100%', maxWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item: any, i: number) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div className="od-legend-item" key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="od-legend-dot" style={{ background: item.color, width: '9px', height: '9px', borderRadius: '50%' }}></div>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{fmtINR(item.value)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--fg)', minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Banner / Breadcrumb & Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px',
        padding: '14px 20px',
        background: 'var(--panel)',
        borderRadius: '12px',
        border: '1px solid var(--border-soft)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--accent-soft, rgba(217,83,30,0.1))',
            color: 'var(--accent, #d9531e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Coins size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--fg)' }}>Tax Liability Dashboard</h2>
              <span style={{
                background: 'var(--green-soft, #ecfdf5)',
                color: 'var(--green, #10b981)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                GSTR-1 Outward Supplies
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Period: <strong>{month || 'May'} {financialYear || '2026-27'}</strong></span>
              <span>&bull;</span>
              <span>Company: <strong>{activeCompany?.name || 'Passary Minerals Madhya Pvt Ltd'}</strong></span>
              {activeCompany?.gstin && (
                <>
                  <span>&bull;</span>
                  <code style={{ fontSize: '11px', background: 'var(--panel-2)', padding: '1px 5px', borderRadius: '4px' }}>{activeCompany.gstin}</code>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/gstr1"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '8px',
              background: 'var(--panel-2)',
              border: '1px solid var(--border-soft)',
              color: 'var(--fg)'
            }}
          >
            <FileText size={15} /> GSTR-1 Sales Register
          </Link>
          <Link
            to="/import?target=gstr1"
            className="btn primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            <Upload size={15} /> Import Sales
          </Link>
        </div>
      </div>

      {/* Demo notice if real data is not loaded yet */}
      {!hasRealData && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(59, 130, 246, 0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '18px',
          fontSize: '12.5px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} />
            <span><strong>Preview Mode:</strong> Showing simulated sales records. Import your monthly GSTR-1 Excel/CSV file to load live sales filings.</span>
          </div>
          <Link to="/import?target=gstr1" style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Import GSTR-1 Now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="od-grid">
        {/* Row 1: KPI Cards */}
        <div className="tax-col tc-orange">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><FileText size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Total Taxable Value</div>
                <div className="tc-sub">Net Outward Turnover</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Taxable Sales</div>
              <div className="tc-amt-val">{fmtINR(mTotalTaxable)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                <span><strong>{activeSales.length}</strong> Total Invoices</span>
                <span className="tc-trend" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <TrendingUp size={12} /> +8.3% MoM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-purple">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><IndianRupee size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Total Output GST</div>
                <div className="tc-sub">Tax Liability Due</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Output GST</div>
              <div className="tc-amt-val">{fmtINR(mOutput)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                <span>Effective Rate: <strong>{mTotalTaxable > 0 ? ((mOutput / mTotalTaxable) * 100).toFixed(1) : 0}%</strong></span>
                <span className="tc-trend" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <TrendingUp size={12} /> +12.5% MoM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-green">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><MapPin size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Inter-State GST (IGST)</div>
                <div className="tc-sub">Cross-State Sales</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total IGST Output</div>
              <div className="tc-amt-val">{fmtINR(mTotalIgst)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                <span>Share: <strong>{mOutput > 0 ? ((mTotalIgst / mOutput) * 100).toFixed(0) : 0}%</strong> of Output</span>
                <span className="tc-trend" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <TrendingUp size={12} /> +6.2% MoM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-blue">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><Landmark size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Intra-State GST</div>
                <div className="tc-sub">Local Sales (CGST+SGST)</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Intra-State Tax</div>
              <div className="tc-amt-val" style={{ marginBottom: '4px' }}>{fmtINR(mTotalCgst + mTotalSgst)}</div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>CGST: <strong style={{ color: 'var(--fg)' }}>{fmtINR(mTotalCgst)}</strong></span>
                <span style={{ color: 'var(--muted)' }}>SGST: <strong style={{ color: 'var(--fg)' }}>{fmtINR(mTotalSgst)}</strong></span>
              </div>
              <div className="tc-trend"><TrendingUp size={12} /> <span>+15.7% MoM</span></div>
            </div>
          </div>
        </div>

        {/* Row 2: Analytics & Split Donut Panels */}
        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">GST Tax Composition</div>
              <div className="od-panel-sub">Breakdown of Output Liability across tax heads</div>
            </div>
            <span style={{ fontSize: '11px', background: 'var(--panel-2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {month} {financialYear}
            </span>
          </div>
          <div className="od-panel-body" style={{ justifyContent: 'center' }}>
            {renderCustomDonut(gstCompData, "Total Output", fmtINR(mOutput))}
          </div>
        </div>

        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Sales Classification Split</div>
              <div className="od-panel-sub">Registered B2B vs Unregistered Retail B2C</div>
            </div>
            <span style={{ fontSize: '11px', background: 'var(--panel-2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {month} {financialYear}
            </span>
          </div>
          <div className="od-panel-body" style={{ justifyContent: 'center' }}>
            {renderCustomDonut(salesSplitData, "Total Sales", fmtINR(mTotalTaxable))}
          </div>
        </div>

        {/* Row 3: Top Performance & Geography Breakdown */}
        <div className="od-panel od-chart-span" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Top 5 Destination States <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(IGST)</span></div>
              <div className="od-panel-sub">Inter-state supplies by Place of Supply</div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Inter-State</span>
          </div>
          <div className="od-panel-body" style={{ padding: '16px' }}>
            {top5Inter.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {top5Inter.map((s: any, i: number) => {
                  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
                  const c = colors[i % colors.length];
                  const pct = Math.min(100, Math.round((s.igst / maxInterIgst) * 100));
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: c,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flex: 'none'
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.pos}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{fmtINR(s.igst)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--border-soft)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, background: c, height: '100%', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', width: '45px', textAlign: 'right' }}>
                            {s.count} inv
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No Inter-State Sales records found.
              </div>
            )}
          </div>
        </div>

        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Top 5 Local Buyers <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(Intra-State)</span></div>
              <div className="od-panel-sub">Highest volume customers within home state</div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Within State</span>
          </div>
          <div className="od-panel-body" style={{ padding: '16px' }}>
            {top5Intra.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {top5Intra.map((s: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>
                        {s.party}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {s.count} Inv
                        </span>
                        <span>&bull; {s.item}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flex: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--fg)' }}>{fmtINR(s.taxable)}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Taxable Value</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No Intra-State Sales records found.
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Recent Sales Invoices (Full Width Table) - Redesigned & Beautiful */}
        <div className="od-panel" style={{ gridColumn: 'span 4' }}>
          <div className="od-panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={17} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="od-panel-title" style={{ fontSize: '15px' }}>Recent Sales Invoices</span>
                  <span style={{
                    background: 'var(--panel-2)',
                    color: 'var(--fg)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '10px'
                  }}>
                    {filteredSales.length} Invoices
                  </span>
                </div>
                <div className="od-panel-sub">Verified outward tax invoices sorted by latest invoice date</div>
              </div>
            </div>

            {/* Controls: Search, Tabs, and View All link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', background: 'var(--panel-2)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterTab === 'all' ? 'var(--panel)' : 'transparent',
                    color: filterTab === 'all' ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: filterTab === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  All ({normalizedSales.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('b2b')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterTab === 'b2b' ? 'var(--panel)' : 'transparent',
                    color: filterTab === 'b2b' ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: filterTab === 'b2b' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  B2B
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('b2c')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterTab === 'b2c' ? 'var(--panel)' : 'transparent',
                    color: filterTab === 'b2c' ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: filterTab === 'b2c' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  B2C
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('inter')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterTab === 'inter' ? 'var(--panel)' : 'transparent',
                    color: filterTab === 'inter' ? 'var(--fg)' : 'var(--muted)',
                    boxShadow: filterTab === 'inter' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Inter-State
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search invoice or party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 10px 6px 30px',
                    fontSize: '12px',
                    borderRadius: '7px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--panel-2)',
                    color: 'var(--fg)',
                    outline: 'none',
                    width: '180px'
                  }}
                />
              </div>

              {/* Functional View All link navigating to /gstr1 */}
              <Link
                to="/gstr1"
                style={{
                  fontSize: '12.5px',
                  color: 'var(--accent, #d9531e)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>View All Invoices</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Table Wrap */}
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0, flex: 1, overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '170px' }}>Invoice Date</th>
                  <th>Invoice No.</th>
                  <th>Customer / Party Name</th>
                  <th>Place of Supply</th>
                  <th style={{ textAlign: 'right' }}>Taxable Value</th>
                  <th style={{ textAlign: 'right' }}>GST Liability</th>
                  <th style={{ textAlign: 'right' }}>Invoice Total</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Type</th>
                  <th style={{ textAlign: 'center', width: '70px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.slice(0, 10).map((t: any, i: number) => {
                    const dateParts = formatDateParts(t.date);

                    return (
                      <tr 
                        key={t.id || i}
                        style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                        onClick={() => setSelectedInvoice(t.raw || t)}
                      >
                        {/* Enhanced Date Display with Calendar Day Badge */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '40px',
                              borderRadius: '8px',
                              background: 'var(--panel-2)',
                              border: '1px solid var(--border-soft)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>
                                {dateParts.day}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                                {dateParts.month}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--fg)' }}>
                                {dateParts.full}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                FY {financialYear || '2026-27'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Invoice Number */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              color: 'var(--fg)',
                              background: 'var(--panel-2)',
                              padding: '2px 7px',
                              borderRadius: '5px',
                              border: '1px solid var(--border-soft)'
                            }}>
                              {t.invoice}
                            </span>
                          </div>
                        </td>

                        {/* Customer / Party Name */}
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--fg)' }}>
                              {t.party}
                            </div>
                            {t.gstin ? (
                              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                                GSTIN: {t.gstin}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                Unregistered Consumer
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Place of Supply */}
                        <td>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: 'var(--fg)',
                            background: 'var(--panel-2)',
                            padding: '2px 8px',
                            borderRadius: '5px'
                          }}>
                            {t.pos}
                          </span>
                        </td>

                        {/* Taxable Amount */}
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '13px', color: 'var(--fg)' }}>
                          {fmtINR(t.amt)}
                        </td>

                        {/* GST Breakdown */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: t.isInter ? '#8b5cf6' : 'var(--fg)' }}>
                              {fmtINR(t.totalTax)}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                              {t.isInter ? 'IGST' : 'CGST+SGST'}
                            </span>
                          </div>
                        </td>

                        {/* Total Invoice */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '13.5px', color: 'var(--fg)' }}>
                          {fmtINR(t.totalInvoice)}
                        </td>

                        {/* Type Badge */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${t.sc}`} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {t.status}
                          </span>
                        </td>

                        {/* Action View Button */}
                        <td style={{ textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); setSelectedInvoice(t.raw || t); }}>
                          <button
                            type="button"
                            title="View Invoice"
                            style={{
                              background: 'var(--panel-2)',
                              border: '1px solid var(--border-soft)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: 'var(--muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                      No sales invoices matched your current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderTop: '1px solid var(--border-soft)',
            background: 'var(--panel-2)',
            fontSize: '12px',
            color: 'var(--muted)'
          }}>
            <div>
              Showing {Math.min(10, filteredSales.length)} of {filteredSales.length} invoices
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Page Total Taxable: <strong style={{ color: 'var(--fg)' }}>{fmtINR(filteredSales.slice(0, 10).reduce((a, b) => a + b.amt, 0))}</strong></span>
              <span>Total Tax: <strong style={{ color: 'var(--fg)' }}>{fmtINR(filteredSales.slice(0, 10).reduce((a, b) => a + b.totalTax, 0))}</strong></span>
              <Link to="/gstr1" style={{ color: 'var(--accent, #d9531e)', fontWeight: 600, textDecoration: 'none' }}>
                Open GSTR-1 Register &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status & Certification Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'var(--panel)',
        borderRadius: '12px',
        border: '1px solid var(--border-soft)',
        marginTop: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--green-soft, #ecfdf5)',
            color: 'var(--green, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>GST Outward Register Status</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>
              Period: {month} {financialYear} &bull; Ready for Reconciliation & Filing
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--green, #10b981)',
          fontWeight: 600,
          fontSize: '13.5px',
          fontStyle: 'italic'
        }}>
          <LeafIcon />
          <span>Simplifying GST & TDS For a Stronger Tomorrow</span>
        </div>
      </div>

      {/* Invoice Detail View Modal */}
      {selectedInvoice && (
        <InvoiceViewModal
          row={selectedInvoice}
          type="gstr1"
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
