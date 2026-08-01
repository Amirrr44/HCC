import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
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

  // Safe StatusBar & Camera Initialization for Mobile (Capacitor)
  useEffect(() => {
    const initNativeFeatures = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          // 1. Configure Status Bar safely without crashing on Web/Android
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          await StatusBar.setStyle({ style: prefersDarkMode ? Style.Dark : Style.Light });
          
          // 2. Request Camera Permission upfront if needed
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
              .catch((err) => console.log("Camera access not granted yet:", err));
          }
        }
      } catch (e) {
        console.warn("Native features bypassed silently:", e);
      }
    };

    initNativeFeatures();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeRoot>
      <CssBaseline />
      
      {/* Container with Safe Area Insets to prevent content overlap under Status/Nav bars */}
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          boxSizing: 'border-box',
        }}
      >
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
      </Box>
    </ThemeRoot>
  );
}
