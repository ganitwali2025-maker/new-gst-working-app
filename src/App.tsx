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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/liability" element={<Liability />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/books" element={<BooksPurchase />} />
            <Route path="/old-itc" element={<GenericTablePage title="Old ITC" type="books" hint="Legacy ITC data" />} />
            <Route path="/itc-not-claimed" element={<GenericTablePage title="ITC Not Claimed" type="books" hint="Unclaimed ITC rows" />} />
            
            <Route path="/gstr2b" element={<GSTR2B />} />
            <Route path="/gstr2b-gov" element={<GenericTablePage title="GSTR-2B Current Month" type="g2b_gov" hint="Government 2B data" />} />
            
            <Route path="/reconciliation" element={<Reconciliation />} />
            <Route path="/unmatch-gst" element={<GenericTablePage title="Unmatch GST" type="books" hint="Unmatched records" />} />
            
            <Route path="/rcm-itc" element={<RcmITC />} />
            <Route path="/rcmdata" element={<RcmData />} />
            <Route path="/books-itc" element={<GenericTablePage title="Books ITC" type="books" hint="ITC from books" />} />
            <Route path="/gstr1" element={<GenericTablePage title="GSTR-1 Sales Register" type="gstr1" hint="Complete sales register and outward supplies for accurate GST return filing." />} />
            
            <Route path="/reports" element={<Reports />} />
            <Route path="/reco-report" element={<GenericTablePage title="Reconciliation Report" type="books" hint="Detailed reco report" />} />
            <Route path="/itc-report" element={<GenericTablePage title="ITC Report" type="books" hint="Comprehensive ITC report" />} />
            
            <Route path="/import" element={<Import />} />
            <Route path="/company" element={<Company />} />
            <Route path="/settings" element={<Settings />} />
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
              <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
