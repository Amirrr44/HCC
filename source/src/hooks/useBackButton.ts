import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTime = useRef<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // ۱. تزریق یک Dummy state تا مرورگر دکمه Back را نبندد
    window.history.pushState({ guard: true }, '', window.location.href);

    const handlePopState = () => {
      const now = Date.now();
      const timeDiff = now - lastBackPressTime.current;
      const currentPath = window.location.pathname;

      // ۱. اگر در صفحه پروفایل یا اعضا باشد -> برگشت مستقیم
      if (currentPath === '/profile' || currentPath === '/members') {
        navigate(-1);
        return;
      }

      // ۲. اگر در صفحه چت باشد -> دو بار زدن برای برگشت به لاگین
      if (currentPath === '/chat') {
        if (timeDiff < 2000) {
          navigate('/', { replace: true });
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to leave the room');
          window.history.pushState({ guard: true }, '', window.location.href);
        }
        return;
      }

      // ۳. اگر در صفحه لاگین باشد -> دو بار زدن برای خروج
      if (currentPath === '/' || currentPath === '/login') {
        if (timeDiff < 2000) {
          window.history.back();
        } else {
          lastBackPressTime.current = now;
          setToastMessage('Press back again to exit the app');
          window.history.pushState({ guard: true }, '', window.location.href);
        }
        return;
      }

      navigate(-1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  return { toastMessage, setToastMessage };
}
