import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useThemeStore } from '../../store/theme';
import { getThemeOptions } from '../../theme';

export const ThemeRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. اتصال مستقیم به استور واقعی تم پروژه
  const mode = useThemeStore((state) => state.mode);

  // 2. ساخت تم دینامیک MUI بر اساس حالت فعلی (dark / light)
  const theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

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
