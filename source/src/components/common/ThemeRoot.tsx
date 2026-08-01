import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '../../store/theme';
import { darkTheme, lightTheme } from '../../theme';

export const ThemeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. استفاده از اسم واقعی هوک تم پروژه (useTheme)
  const mode = useTheme((state) => state.mode);

  // 2. انتخاب تم MUI متناسب با حالت فعلی
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // 3. همگام‌سازی StatusBar اندروید با تغییر تم
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
