import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { OfflineBanner } from './components/OfflineBanner';
import { PageTransition } from './components/Animations';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { FeesScreen } from './screens/FeesScreen';
import { ProfileScreen } from './screens/ProfileScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AnimatedScreen({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PageTransition>{children}</PageTransition>
    </ProtectedRoute>
  );
}

const NAV_ROUTES = ['/home', '/progress', '/attendance', '/fees', '/profile'];

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const showNav = isAuthenticated && NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <PageTransition>
                <LoginScreen />
              </PageTransition>
            )
          }
        />
        <Route path="/home" element={<AnimatedScreen><HomeScreen /></AnimatedScreen>} />
        <Route path="/progress" element={<AnimatedScreen><ProgressScreen /></AnimatedScreen>} />
        <Route path="/attendance" element={<AnimatedScreen><AttendanceScreen /></AnimatedScreen>} />
        <Route path="/fees" element={<AnimatedScreen><FeesScreen /></AnimatedScreen>} />
        <Route path="/profile" element={<AnimatedScreen><ProfileScreen /></AnimatedScreen>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineBanner />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
