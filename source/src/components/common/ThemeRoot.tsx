/**
 * ThemeRoot — provides the MUI ThemeProvider bound to the current
 * theme mode, and renders a small floating toggle in the bottom-right
 * corner so the user can switch modes at any time.
 *
 * Also injects a tiny <style> block that colors the system status /
 * navigation bars to match the app background on supporting browsers.
 */

import { useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Fab, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useTheme } from '../../store/theme';
import { buildTheme } from '../../theme';

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const mode = useTheme((s) => s.mode);
  const ready = useTheme((s) => s.ready);
  const toggle = useTheme((s) => s.toggle);
  const init = useTheme((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  // The CSS variable is also set by the store, but we keep an inline
  // style on the document element for redundancy.
  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg', theme.palette.background.default);
  }, [theme]);

  if (!ready) {
    // Render nothing while we read the preference to avoid a flash.
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Raw CSS to make the html / body and system bars match the
          theme. The browser uses these values for the address bar
          (mobile) and the status / nav bar (Android). */}
      <style>{`
        html, body, #root {
          background: ${theme.palette.background.default};
          color: ${theme.palette.text.primary};
          min-height: 100dvh;
        }
        body { margin: 0; }
      `}</style>
      {children}
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <Fab
          size="small"
          onClick={toggle}
          aria-label="Toggle theme"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1300,
            background: theme.palette.surface.main,
            color: theme.palette.text.primary,
            '&:hover': {
              background: theme.palette.surface.main,
              opacity: 0.85,
            },
          }}
        >
          {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </Fab>
      </Tooltip>
    </ThemeProvider>
  );
}
