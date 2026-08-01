import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
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

  // Direct Native Camera Permission & StatusBar Sync
  useEffect(() => {
    const requestNativePermissions = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          // 1. Request Camera Permission directly using Capacitor Native Camera Plugin
          const { Camera } = await import('@capacitor/camera');
          const status = await Camera.checkPermissions();
          if (status.camera !== 'granted') {
            await Camera.requestPermissions({ permissions: ['camera'] });
          }

          // 2. Sync Native Status Bar with System Theme
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          await StatusBar.setStyle({ style: prefersDarkMode ? Style.Dark : Style.Light });
        }
      } catch (e) {
        console.warn("Native initializations bypassed:", e);
      }
    };

    requestNativePermissions();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeRoot>
      <CssBaseline />
      <AppErrorBoundary>
        <ProfileBootstrap>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ProfileBootstrap>
      </AppErrorBoundary>
    </ThemeRoot>
  );
}
