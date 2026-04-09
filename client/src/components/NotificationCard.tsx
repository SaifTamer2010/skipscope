"use client";

import { useNotificationStore } from "@/store/notificationStore";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <div
      className={`
        relative px-6 py-5 rounded-2xl border transition-all duration-300 group
        ${
          notification.is_read
            ? "bg-background-secondry/20 border-border-muted"
            : "bg-background-secondry/60 backdrop-blur-xl border-brand-primary/20 shadow-lg shadow-brand-primary/5"
        }
      `}
    >
      {/* Unread Indicator */}
      {!notification.is_read && (
        <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_8px_var(--color-brand-primary)] animate-pulse" />
      )}

      <div className="flex flex-col gap-3">
        <p className={`text-sm font-medium leading-relaxed ${notification.is_read ? "text-text-secondry/80" : "text-text-primary"}`}>
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-secondry/60 uppercase tracking-widest bg-background-main/30 px-2 py-0.5 rounded-md border border-border-muted">
              {formatTime(notification.created_at)}
            </span>
            {!notification.is_read && (
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">New Update</span>
            )}
          </div>
          
          {!notification.is_read && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-strong transition-all uppercase tracking-wider flex items-center gap-1.5 group/btn"
            >
              Mark as read
              <div className="w-4 h-[1px] bg-brand-primary/30 group-hover/btn:w-6 transition-all" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
