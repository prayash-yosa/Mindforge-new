import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ResultsScreen } from './screens/ResultsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginScreen />}
      />
      <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/activity/:type/:id" element={<ProtectedRoute><ActivityScreen /></ProtectedRoute>} />
      <Route path="/results/:type/:id" element={<ProtectedRoute><ResultsScreen /></ProtectedRoute>} />
      {/* Stubs for bottom nav — Sprint 7 */}
      <Route path="/attendance" element={<ProtectedRoute><Placeholder title="Attendance" /></ProtectedRoute>} />
      <Route path="/doubts" element={<ProtectedRoute><Placeholder title="Doubts" /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Placeholder title="Profile" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: 'var(--color-bg)' }}>
      <h2 style={{ color: 'var(--color-brown)' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Coming in Sprint 7</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
