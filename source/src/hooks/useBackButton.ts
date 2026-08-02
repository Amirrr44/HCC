import { useEffect } from 'react';

interface UseBackButtonOptions {
  onBack: () => void;
}

export function useBackButton({ onBack }: UseBackButtonOptions) {
  useEffect(() => {
    // افزودن یک Guard به تاریخچه مرورگر
    window.history.pushState({ pageGuard: true }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // قفل نگه‌داشتن مجدد تاریخچه برای لیسنر بعدی
      window.history.pushState({ pageGuard: true }, '', window.location.href);
      
      // اجرای بلافاصله اکشن بازگشت با یک بار زدن کلید
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);
}
