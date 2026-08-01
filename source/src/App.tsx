import React, { useEffect, useMemo } from 'react';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline, 
  useMediaQuery, 
  Box, 
  Container 
} from '@mui/material';

export default function App() {
  // 1. Automatic system theme detection (Dark/Light)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#00e676',
          },
          background: {
            default: prefersDarkMode ? '#121212' : '#f5f5f5',
            paper: prefersDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [prefersDarkMode]
  );

  // Safe StatusBar execution to prevent blank/black screen crashes on Android
  useEffect(() => {
    const updateStatusBar = async () => {
      try {
        // Dynamically import StatusBar only inside native platform to prevent web crash
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          if (prefersDarkMode) {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({ color: '#121212' });
          } else {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#f5f5f5' });
          }
        }
      } catch (e) {
        console.warn("StatusBar integration bypassed silently:", e);
      }
    };
    updateStatusBar();
  }, [prefersDarkMode]);

  // 2. Direct camera permission request for QR Code scanning
  const handleOpenScanner = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        console.log("Camera access granted:", stream);
      } else {
        alert("Camera is not supported on this device.");
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      alert("Please allow camera access in your device settings.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* 3. Safe Area Insets to fix layout overflow under status/nav bars */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: 'background.default',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          boxSizing: 'border-box',
        }}
      >
        <Container 
          maxWidth="md" 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            p: 2,
            overflowY: 'auto'
          }}
        >
          {/* Main App Content / UI goes here */}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
