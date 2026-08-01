import React, { useEffect, useMemo } from 'react';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline, 
  useMediaQuery, 
  Box, 
  Container 
} from '@mui/material';

import { StatusBar, Style } from '@capacitor/status-bar';

export default function App() {
  // 1. Automatic system theme detection (Dark/Light) without manual toggle button
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

  // Sync mobile status bar style with the active theme
  useEffect(() => {
    const updateStatusBar = async () => {
      try {
        if (prefersDarkMode) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#121212' });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#f5f5f5' });
        }
      } catch (e) {
        // Fallback if running on standard web browser without Capacitor
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
        console.log("Camera permission granted:", stream);
      } else {
        alert("Camera is not supported on this device.");
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      alert("Please allow camera access in your device settings to scan QR codes.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* 3. Safe Area Insets to prevent overlap with Status Bar & Navigation Bar */}
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
        {/* Main application container */}
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
          {/* Your chat components, headers, and message inputs go here */}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
