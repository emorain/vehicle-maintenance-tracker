import { useEffect, useState } from 'react';
import { ProtocolService } from '../services/ProtocolService';
import { MaintenanceDue } from '../types/Protocol';

interface NotificationBellProps {
  onClick?: () => void;
}

export const NotificationBell = ({ onClick }: NotificationBellProps) => {
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceDue = async () => {
      try {
        const data = await ProtocolService.getAllUpcomingMaintenance();
        setMaintenanceDue(data);
      } catch (error) {
        console.error('Failed to fetch maintenance due:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceDue();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMaintenanceDue, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const overdueCount = maintenanceDue.filter(m => m.is_overdue).length;
  const upcomingCount = maintenanceDue.filter(m =>
    !m.is_overdue &&
    ((m.days_until_due !== null && m.days_until_due <= 30) ||
     (m.miles_until_due !== null && m.miles_until_due <= 3000))
  ).length;

  const totalCount = overdueCount + upcomingCount;

  if (loading || totalCount === 0) {
    return null; // Don't show the bell if there are no notifications
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-white hover:bg-white/20 rounded-lg transition"
      title={`${overdueCount} overdue, ${upcomingCount} upcoming`}
    >
      {/* Bell Icon */}
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Notification Badge */}
      {totalCount > 0 && (
        <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          overdueCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
        } text-white`}>
          {totalCount > 9 ? '9+' : totalCount}
        </span>
      )}

      {/* Pulse animation for overdue items */}
      {overdueCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        </span>
      )}
    </button>
  );
};
