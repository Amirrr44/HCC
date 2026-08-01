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

// مدیریت سراسری دکمه برگشت سخت‌افزاری / مرورگر
function BackButtonManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTime = useRef<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ۱. کنترل رویدادهای نیتیو اندروید (Capacitor / Cordova)
  useEffect(() => {
    const handleNativeBackButton = (e: any) => {
      // جلوگیری از رفتار پیش‌فرض نیتیو (که بستن آنی اپلیکیشن هست)
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = window.location.pathname;

      // ۱. صفحات فرعی (پروفایل، اعضا و...) -> برگشت آنی به صفحه قبل
      if (currentPath === '/profile' || currentPath === '/members') {
        navigate(-1);
        return;
      }

      // ۲. اتاق چت -> دوبار زدن برای خروج به لاگین
      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to leave the room');
        }
        return;
      }

      // ۳. صفحه لاگین -> دوبار زدن برای خروج از اپلیکیشن
      if (currentPath === '/' || currentPath === '/login') {
        if (timeDiff < 2000) {
          if ((window as any).navigator?.app?.exitApp) {
            (window as any).navigator.app.exitApp();
          } else if ((window as any).Capacitor?.Plugins?.App) {
            (window as any).Capacitor.Plugins.App.exitApp();
          } else {
            window.history.back();
          }
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to exit the app');
        }
        return;
      }

      navigate(-1);
    };

    // اضافه کردن Listener برای Cordova / PhoneGap / Capacitor
    document.addEventListener('backbutton', handleNativeBackButton, false);

    return () => {
      document.removeEventListener('backbutton', handleNativeBackButton, false);
    };
  }, [navigate]);

  // ۲. کنترل تاریخچه مرورگر (Web History API)
  useEffect(() => {
    // به ازای هر بار تغییر مسیر، یک History Entry جدید تزریق می‌کنیم تا دکمه برگشت برنامه‌مان را نبندد
    window.history.pushState({ page: location.pathname }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // بلافاصله هیستوری را نگه می‌داریم
      window.history.pushState({ page: location.pathname }, '', window.location.href);

      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = location.pathname;

      if (currentPath === '/profile' || currentPath === '/members') {
        navigate(-1);
        return;
      }

      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to leave the room');
        }
        return;
      }

      if (currentPath === '/' || currentPath === '/login') {
        if (timeDiff < 2000) {
          if ((window as any).navigator?.app?.exitApp) {
            (window as any).navigator.app.exitApp();
          } else if ((window as any).Capacitor?.Plugins?.App) {
            (window as any).Capacitor.Plugins.App.exitApp();
          }
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to exit the app');
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
