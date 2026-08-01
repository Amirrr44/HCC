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

function BackButtonManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTime = useRef<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ایجاد یک Trap در تاریخچه مرورگر موقع تغییر صفحه
  useEffect(() => {
    // ۱. پُر کردن هیستوری برای جلوگیری از خروج آنی
    window.history.pushState({ guard: true }, '', window.location.href);

    const handlePopState = () => {
      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = window.location.pathname;

      // ۱. صفحات فرعی (پروفایل و اعضا) -> برگشت به صفحه قبل
      if (currentPath === '/profile' || currentPath === '/members') {
        navigate(-1);
        return;
      }

      // ۲. صفحه چت -> دو بار زدن برای خروج به لاگین
      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to leave the room');
          // دوباره هیستوری را قفل می‌کنیم
          window.history.pushState({ guard: true }, '', window.location.href);
        }
        return;
      }

      // ۳. صفحه لاگین -> دو بار زدن برای خروج کامل
      if (currentPath === '/' || currentPath === '/login') {
        if (timeDiff < 2000) {
          // اگر کپسیتیور/کوردوا یا WebView باشه برنامه رو می‌بنده
          if ((window as any).Capacitor?.Plugins?.App) {
            (window as any).Capacitor.Plugins.App.exitApp();
          } else if ((window as any).navigator?.app?.exitApp) {
            (window as any).navigator.app.exitApp();
          } else {
            // در مرورگر عادی، اجازه خروج داده می‌شود
            window.history.back();
          }
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to exit the app');
          // هیستوری را قفل نگه می‌داریم تا ضربه دوم زده شود
          window.history.pushState({ guard: true }, '', window.location.href);
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
