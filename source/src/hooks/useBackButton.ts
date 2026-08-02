import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface UseBackButtonOptions {
  onBack: () => void;
}

export function useBackButton({ onBack }: UseBackButtonOptions) {
  useEffect(() => {
    // اگر روی وب هستیم، نیازی به این Listener نیست و مرورگر خودش popstate را مدیریت می‌کند
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let backListener: { remove: () => void } | null = null;

    const setupListener = async () => {
      // ثبت Listener رسمی Capacitor برای دکمه برگشت اندروید
      backListener = await CapApp.addListener('backButton', () => {
        onBack();
      });
    };

    void setupListener();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [onBack]);
}
