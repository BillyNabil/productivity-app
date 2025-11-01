import { useEffect, useState } from 'react';
import { requestNotificationPermission, isNotificationEnabled } from '@/lib/utils/notification-utils';

/**
 * Hook untuk request dan manage browser notification permissions
 */
export function useNotificationPermission() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check current notification status
  useEffect(() => {
    setNotificationEnabled(isNotificationEnabled());
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationEnabled(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    notificationEnabled,
    isRequesting,
    requestPermission,
  };
}
