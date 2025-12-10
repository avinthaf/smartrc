import { useEffect, useCallback } from 'react';
import { useBeforeUnload, useNavigate, useLocation } from 'react-router';

export function useLeavePageConfirmation(shouldWarn: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Handle page refresh or tab close
  useBeforeUnload(
    useCallback((e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        const message = 'Are you sure you want to leave? Your progress may be lost.';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    }, [shouldWarn])
  );

  // Handle in-app navigation
  useEffect(() => {
    if (!shouldWarn) return;

    const unblock = (window as any).history.block((tx: any) => {
      if (tx.pathname !== currentPath) {
        if (window.confirm('Are you sure you want to leave? Your progress may be lost.')) {
          unblock();
          navigate(tx.pathname);
        }
        return false;
      }
      return true;
    });

    return () => unblock();
  }, [shouldWarn, currentPath, navigate]);
}
