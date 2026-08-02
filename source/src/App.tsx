import React, { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
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

// Inner component to execute useBackButton within the BrowserRouter context
function AppRoutes() {
  const navigate = useNavigate();

  // Handler passed to the back button hook
  const handleBack = useCallback((isDoubleTap: boolean) => {
    if (isDoubleTap) {
      // Navigates back if double-tapped within 2 seconds
      navigate(-1);
    } else {
      // Single tap feedback (you can trigger a toast notification here if desired)
      console.log('Press back again to exit or go back.');
    }
  }, [navigate]);

  // Safely passing the required onBack property
  useBackButton({ onBack: handleBack });

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
          {/* Main App Container handling Safe Areas and full screen dimensions */}
          <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#101014] pt-[var(--sat)] pb-[var(--sab)] pl-[var(--sal)] pr-[var(--sar)]">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </ProfileBootstrap>
      </AppErrorBoundary>
    </ThemeRoot>
  );
}
