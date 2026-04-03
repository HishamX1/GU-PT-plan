import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Custom hook for real-time synchronization of study plan data
 * Automatically invalidates queries when admin makes changes
 */
export function useRealtimeSync() {
  const utils = trpc.useUtils();

  useEffect(() => {
    // Set up polling interval for data synchronization (every 2 seconds)
    const interval = setInterval(() => {
      // Invalidate all study-related queries to fetch fresh data
      utils.study.getFaculties.invalidate();
      utils.study.getPrograms.invalidate();
      utils.study.getYears.invalidate();
      utils.study.getSemesters.invalidate();
      utils.study.getCourses.invalidate();
    }, 2000);

    return () => clearInterval(interval);
  }, [utils]);

  // Alternative: Use WebSocket for real-time updates (when available)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        utils.study.getFaculties.invalidate();
        utils.study.getPrograms.invalidate();
        utils.study.getYears.invalidate();
        utils.study.getSemesters.invalidate();
        utils.study.getCourses.invalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [utils]);
}
