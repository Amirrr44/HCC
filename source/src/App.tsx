import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Snackbar } from '@mui/material';
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

// کامپوننت مدیریت دکمه برگشت و نمایش Toast کپسولی
function BackButtonHandler() {
  const { toastMessage, setToastMessage } = useBackButton();

  return (
    <Snackbar
      open={!!toastMessage}
      autoHideDuration={2000}
      onClose={() => setToastMessage(null)}
      message={toastMessage}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      ContentProps={{
        sx: {
          backgroundColor: 'rgba(40, 40, 40, 0.95)',
          color: '#fff',
          borderRadius: '20px',
          px: 2.5,
          py: 0.5,
          minWidth: 'auto',
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
          {/* کانتینر اصلی برنامه برای مدیریت Safe Area و ابعاد کامل صفحه */}
          <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#101014] pt-[var(--sat)] pb-[var(--sab)] pl-[var(--sal)] pr-[var(--sar)]">
            <BrowserRouter>
              <BackButtonHandler />
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
