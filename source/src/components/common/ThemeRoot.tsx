import React, { useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from '../../store/theme';

export const ThemeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. دریافت حالت فعلی (dark یا light) از استور پروژه
  const mode = useTheme((state) => state.mode);

  // 2. ساخت مستقیم تم MUI بدون نیاز به هیچ فایل جانبی
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode || 'dark',
        },
      }),
    [mode]
  );

  // 3. همگام‌سازی Status Bar اندروید با تم
  useEffect(() => {
    const syncStatusBar = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({
            style: mode === 'dark' ? Style.Dark : Style.Light,
          });
        }
      } catch (e) {
        console.warn('StatusBar sync bypass:', e);
      }
    };

    syncStatusBar();
  }, [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
