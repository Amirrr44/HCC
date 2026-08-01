import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BackButtonOptions {
  scannerOpen?: boolean;
  closeScanner?: () => void;
  onShowToast?: (message: string) => void;
}

export function useBackButton({
  scannerOpen,
  closeScanner,
  onShowToast,
}: BackButtonOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    // Push dummy state to capture back button events
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = location.pathname;

      // 1. If QR Scanner dialog is open -> Close it
      if (scannerOpen && closeScanner) {
        closeScanner();
        window.history.pushState(null, '', window.location.href);
        return;
      }

      // 2. Profile page -> Back to login or previous page
      if (currentPath === '/profile') {
        navigate(-1);
        return;
      }

      // 3. Room Profile / Settings drawer/modal inside chat -> back to chat
      // (Handled by route or sub-paths if any)

      // 4. Chat room -> Double tap to leave room and go to Login
      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          onShowToast?.('Press back again to leave the room');
          window.history.pushState(null, '', window.location.href);
        }
        return;
      }

      // 5. Login page -> Double tap to exit application
      if (currentPath === '/' || currentPath === '/login') {
        if (timeDiff < 2000) {
          // Attempt to close app (works on Android PWA/Webview/Cordova/Capacitor)
          if ((window as any).navigator?.app?.exitApp) {
            (window as any).navigator.app.exitApp();
          } else {
            window.history.back();
          }
        } else {
          lastBackPressTime.current = now;
          onShowToast?.('Press back again to exit the app');
          window.history.pushState(null, '', window.location.href);
        }
        return;
      }

      // Default fallback
      navigate(-1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, scannerOpen, closeScanner, navigate, onShowToast]);
}
