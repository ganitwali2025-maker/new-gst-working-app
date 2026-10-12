import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Header';
import { ToastProvider } from './components/common/Toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Dashboard from './components/views/Dashboard';
import Liability from './components/views/LiabilityDashboard';
import BooksPurchase from './components/views/BooksPurchase';
import GSTR2B from './components/views/GSTR2B';
import RcmData from './components/views/RcmView';
import RcmITC from './components/views/RcmITC';
import Reconciliation from './components/views/ITCReconciliation';
import Reports from './components/views/Reports';
import Import from './components/views/Import';
import Company from './components/views/Company';
import Settings from './components/views/SettingsView';
import Payment from './components/views/PaymentDashboard';
import GenericTablePage from './components/views/GenericTablePage';

import Introduction from './components/views/auth/Introduction';
import SecureAccess from './components/views/auth/SecureAccess';
import Login from './components/views/auth/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth() as any;
  
  if (loading) {
    return <div className="auth-page"><div className="auth-title">Loading workspace...</div></div>;
  }
  
  if (!user) {
    return <Navigate to="/intro" replace />;
  }
  
  return children;
}

function ModuleGuard({ moduleId, children }: { moduleId: string; children: React.ReactNode }) {
  const { hasModuleAccess, user } = useAuth() as any;
  
  if (!user) return <Navigate to="/intro" replace />;

  if (!hasModuleAccess(moduleId, 'view')) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ color: 'var(--red)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Access Denied
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          You do not have permission to view this module. Please contact your system Administrator.
        </div>
        <button 
          className="btn primary" 
          onClick={() => window.history.back()}
          style={{ padding: '8px 20px', borderRadius: '8px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div id="shell" className={sidebarOpen ? '' : 'sidebar-closed'}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div id="main-col">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main id="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ModuleGuard moduleId="dashboard"><Dashboard /></ModuleGuard>} />
            <Route path="/liability" element={<ModuleGuard moduleId="summary"><Liability /></ModuleGuard>} />
            <Route path="/payment" element={<ModuleGuard moduleId="summary"><Payment /></ModuleGuard>} />
            <Route path="/books" element={<ModuleGuard moduleId="book_itc"><BooksPurchase /></ModuleGuard>} />
            <Route path="/old-itc" element={<ModuleGuard moduleId="old_itc"><GenericTablePage title="Old ITC" type="books" hint="Legacy ITC data" /></ModuleGuard>} />
            <Route path="/itc-not-claimed" element={<ModuleGuard moduleId="not_claimed_itc"><GenericTablePage title="ITC Not Claimed" type="books" hint="Unclaimed ITC rows" /></ModuleGuard>} />
            
            <Route path="/gstr2b" element={<ModuleGuard moduleId="all_month_2b"><GSTR2B /></ModuleGuard>} />
            <Route path="/gstr2b-gov" element={<ModuleGuard moduleId="current_month_2b"><GenericTablePage title="GSTR-2B Current Month" type="g2b_gov" hint="Government 2B data" /></ModuleGuard>} />
            
            <Route path="/reconciliation" element={<ModuleGuard moduleId="itc_reconciliation"><Reconciliation /></ModuleGuard>} />
            <Route path="/unmatch-gst" element={<ModuleGuard moduleId="difference_data"><GenericTablePage title="Unmatch GST" type="books" hint="Unmatched records" /></ModuleGuard>} />
            
            <Route path="/rcm-itc" element={<ModuleGuard moduleId="rcm_itc"><RcmITC /></ModuleGuard>} />
            <Route path="/rcmdata" element={<ModuleGuard moduleId="reverse_itc"><RcmData /></ModuleGuard>} />
            <Route path="/books-itc" element={<ModuleGuard moduleId="book_itc"><GenericTablePage title="Books ITC" type="books" hint="ITC from books" /></ModuleGuard>} />
            <Route path="/gstr1" element={<ModuleGuard moduleId="gstr1_sales"><GenericTablePage title="GSTR-1 Sales Register" type="gstr1" hint="Complete sales register and outward supplies for accurate GST return filing." /></ModuleGuard>} />
            
            <Route path="/reports" element={<ModuleGuard moduleId="reports"><Reports /></ModuleGuard>} />
            <Route path="/reco-report" element={<ModuleGuard moduleId="reports"><GenericTablePage title="Reconciliation Report" type="books" hint="Detailed reco report" /></ModuleGuard>} />
            <Route path="/itc-report" element={<ModuleGuard moduleId="reports"><GenericTablePage title="ITC Report" type="books" hint="Comprehensive ITC report" /></ModuleGuard>} />
            
            <Route path="/import" element={<ModuleGuard moduleId="import_data"><Import /></ModuleGuard>} />
            <Route path="/company" element={<ModuleGuard moduleId="settings"><Company /></ModuleGuard>} />
            <Route path="/settings" element={<ModuleGuard moduleId="settings"><Settings /></ModuleGuard>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/intro" element={<Introduction />} />
              <Route path="/login" element={<Login />} />
              <Route path="/secure-access" element={<SecureAccess />} />
              <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
