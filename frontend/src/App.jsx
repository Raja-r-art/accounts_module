import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Students       from './pages/Students';
import FeeStructures  from './pages/FeeStructures';
import StudentFees    from './pages/StudentFees';
import Receipts       from './pages/Receipts';
import ExpensesIncomes from './pages/ExpensesIncomes';
import Scholarships   from './pages/Scholarships';
import Salaries       from './pages/Salaries';
import Reports        from './pages/Reports';
import UsersPage      from './pages/UsersPage';
import Notifications  from './pages/Notifications';
import AuditLogs      from './pages/AuditLogs';

// Layout with sidebar
const AppLayout = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '.875rem', borderRadius: '10px', border: '1px solid #E2E8F0' },
          success: { iconTheme: { primary: '#38A169', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E53E3E', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected Layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/students"      element={<Students />} />
          <Route path="/fee-structures" element={<FeeStructures />} />
          <Route path="/student-fees"  element={<StudentFees />} />
          <Route path="/receipts"      element={<Receipts />} />
          <Route path="/incomes"       element={<ExpensesIncomes />} />
          <Route path="/expenses"      element={<ExpensesIncomes />} />
          <Route path="/scholarships"  element={<Scholarships />} />
          <Route path="/salaries"      element={<Salaries />} />
          <Route path="/reports"       element={<Reports />} />
          <Route path="/users"         element={
            <ProtectedRoute allowedRoles={['super_admin','principal']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs"    element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
