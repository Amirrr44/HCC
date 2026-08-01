import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Snackbar } from '@mui/material';
import { ThemeRoot } from './components/common/ThemeRoot';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { MembersPage } from './pages/MembersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppErrorBoundary } from './components/common/ErrorBoundary';
import { useProfile } from './store/profile';

function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const init = useProfile((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return <>{children}</>;
}

// کامپوننت مدیریت متمرکز دکمه برگشت و Toast ریز خاکستری
function BackButtonManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTime = useRef<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = location.pathname;

      // 1. Profile / Members -> Go back instantly
      if (currentPath === '/profile' || currentPath === '/members') {
        navigate(-1);
        return;
      }

      // 2. Chat room -> Double tap to leave room and go to Login
      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to leave the room');
          window.history.pushState(null, '', window.location.href);
        }
        return;
      }

      // 3. Login page -> Double tap to exit application
      if (currentPath === '/') {
        if (timeDiff < 2000) {
          if ((window as any).navigator?.app?.exitApp) {
            (window as any).navigator.app.exitApp();
          } else {
            window.history.back();
          }
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to exit the app');
          window.history.pushState(null, '', window.location.href);
        }
        return;
      }

      navigate(-1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  return (
    <Snackbar
      open={!!toastMessage}
      autoHideDuration={2000}
      onClose={() => setToastMessage(null)}
      message={toastMessage}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      ContentProps={{
        sx: {
          backgroundColor: 'rgba(40, 40, 40, 0.92)',
          color: '#fff',
          borderRadius: '20px',
          px: 2.5,
          py: 0.5,
          minWidth: 'auto',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '0.825rem',
          fontWeight: 500,
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeRoot>
      <CssBaseline />
      <AppErrorBoundary>
        <ProfileBootstrap>
          <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#101014] pt-[var(--sat)] pb-[var(--sab)] pl-[var(--sal)] pr-[var(--sar)]">
            <BrowserRouter>
              <BackButtonManager />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </div>
        </ProfileBootstrap>
      </AppErrorBoundary>
    </ThemeRoot>
  );
}
