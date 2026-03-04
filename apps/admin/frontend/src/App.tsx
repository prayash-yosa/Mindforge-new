import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { PageTransition } from './components/Animations';
import { AppShell } from './components/AppShell';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import UsersScreen from './screens/UsersScreen';
import FeesScreen from './screens/FeesScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import PaymentInfoScreen from './screens/PaymentInfoScreen';
import AuditLogsScreen from './screens/AuditLogsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<PageTransition><DashboardScreen /></PageTransition>} />
        <Route path="users" element={<PageTransition><UsersScreen /></PageTransition>} />
        <Route path="fees" element={<PageTransition><FeesScreen /></PageTransition>} />
        <Route path="payments" element={<PageTransition><PaymentsScreen /></PageTransition>} />
        <Route path="payment-info" element={<PageTransition><PaymentInfoScreen /></PageTransition>} />
        <Route path="audit-logs" element={<PageTransition><AuditLogsScreen /></PageTransition>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
