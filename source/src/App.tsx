import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { App } from '@capacitor/app';
import { ThemeRoot } from './components/common/ThemeRoot';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { MembersPage } from './pages/MembersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppErrorBoundary } from './components/common/ErrorBoundary';
import { useProfile } from './store/profile';
import { useBackButton } from './hooks/useBackButton';

function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const init = useProfile((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // مدیریت هوشمند دکمه Back بر اساس صفحه جاری
  useBackButton({
    onBack: (isDoubleTap: boolean) => {
      if (!isDoubleTap) return;

      // ۱. اگر کاربر در صفحه لاگین یا ریشه برنامه باشد، با ضربه دوم برنامه بسته می‌شود
      if (location.pathname === '/' || location.pathname === '/login') {
        void App.exitApp();
      } else {
        // ۲. اگر در صفحات دیگر (مثل چت، پروفایل و...) باشد، به صفحه قبلی برمی‌گردد
        navigate(-1);
      }
    },
  });

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
              <AppContent />
            </BrowserRouter>
          </div>
        </ProfileBootstrap>
      </AppErrorBoundary>
    </ThemeRoot>
  );
}
