export type ModuleAction = 'view' | 'add' | 'edit' | 'delete' | 'import' | 'export' | 'import_export';

export interface ModulePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
  import_export?: boolean;
}

export type PermissionMap = Record<string, ModulePermission>;

export interface AppUser {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hex string
  designation: string;
  role: 'ADMIN' | 'USER';
  status: 'Active' | 'Inactive';
  permissions: PermissionMap;
  createdAt: string;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  path?: string;
  description: string;
  category: 'Overview' | 'ITC & Reconciliation' | 'GSTR & Tax' | 'Reports' | 'Data & System';
}

export const APP_MODULES: ModuleDefinition[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', description: 'ITC Dashboard & Audit Intelligence Overview', category: 'Overview' },
  { id: 'summary', label: 'Summary', path: '/liability', description: 'Liability & Payment Financial Summary', category: 'Overview' },
  { id: 'itc_reconciliation', label: 'ITC Reconciliation', path: '/reconciliation', description: 'Books vs GSTR-2B Line-by-Line Match', category: 'ITC & Reconciliation' },
  { id: 'old_itc', label: 'Old ITC', path: '/old-itc', description: 'Legacy ITC carried forward', category: 'ITC & Reconciliation' },
  { id: 'not_claimed_itc', label: 'Not Claimed ITC', path: '/itc-not-claimed', description: 'Unclaimed ITC line items', category: 'ITC & Reconciliation' },
  { id: 'all_month_2b', label: 'All Month 2B', path: '/gstr2b', description: 'GSTR-2B Consolidated Statement across all periods', category: 'ITC & Reconciliation' },
  { id: 'current_month_2b', label: 'Current Month 2B', path: '/gstr2b-gov', description: 'Current Period Auto-drafted 2B statement', category: 'ITC & Reconciliation' },
  { id: 'book_itc', label: 'Book ITC (Purchase)', path: '/books', description: 'Purchase Register & Books ITC with 2B reco', category: 'ITC & Reconciliation' },
  { id: 'rcm_itc', label: 'RCM ITC', path: '/rcm-itc', description: 'Reverse Charge ITC overview & eligibility', category: 'GSTR & Tax' },
  { id: 'gstr1_sales', label: 'GSTR-1 Sales', path: '/gstr1', description: 'GSTR-1 Outward Supply & Sales Register', category: 'GSTR & Tax' },
  { id: 'reverse_itc', label: 'Reverse ITC', path: '/rcmdata', description: 'ITC Ineligibility & Inward Reverse Charges', category: 'GSTR & Tax' },
  { id: 'difference_data', label: 'Difference Data', path: '/unmatch-gst', description: 'Tax & Rate Discrepancies Register', category: 'GSTR & Tax' },
  { id: 'reports', label: 'Reports', path: '/reports', description: 'GST Summaries & Audit Reports', category: 'Reports' },
  { id: 'import_data', label: 'Import Data', path: '/import', description: 'Bulk Excel & CSV Data Importer', category: 'Data & System' },
  { id: 'export_data', label: 'Export Data', path: '/reports', description: 'Excel & Print Export Capability', category: 'Data & System' },
  { id: 'settings', label: 'Settings', path: '/settings', description: 'App appearance, tolerance & matching settings', category: 'Data & System' },
  { id: 'user_management', label: 'User Management', path: '/settings', description: 'User creation, roles & module access permissions', category: 'Data & System' },
];

export const DEFAULT_PERMISSION: ModulePermission = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  import: false,
  export: false,
  import_export: false,
};

export const FULL_PERMISSION: ModulePermission = {
  view: true,
  add: true,
  edit: true,
  delete: true,
  import: true,
  export: true,
  import_export: true,
};

export function createEmptyPermissions(): PermissionMap {
  const p: PermissionMap = {};
  APP_MODULES.forEach(m => {
    p[m.id] = { ...DEFAULT_PERMISSION };
  });
  return p;
}

export function createFullPermissions(): PermissionMap {
  const p: PermissionMap = {};
  APP_MODULES.forEach(m => {
    p[m.id] = { ...FULL_PERMISSION };
  });
  return p;
}
