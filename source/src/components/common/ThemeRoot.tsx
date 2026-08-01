import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '../../store/theme';
import { getTheme } from '../../theme';

export const ThemeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. دریافت حالت فعلی تم (dark / light) از Zustand
  const mode = useTheme((state) => state.mode);

  // 2. دریافت تم MUI مناسب با استفاده از تابع getTheme سورس پروژه
  const theme = getTheme(mode);

  // 3. همگام‌سازی نوار وضعیت (StatusBar) اندروید با تم
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
        console.warn('StatusBar sync failed:', e);
      }
    };

    syncStatusBar();
  }, [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
