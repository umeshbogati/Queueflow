import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import type { Notification } from "../../api/notificationApi";

// Toast for the newest notification, which appears in the bottom-right corner
const NotificationToast = () => {
  const newest = useAppSelector((state) => state.notification.items[0]);

  const [toast, setToast] = useState<Notification | null>(null);
  // Tracks which notification we last saw so we only toast genuinely NEW ones
  const lastSeenId = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!newest) return;

    if (isFirstRender.current) {
      // On mount just remember the current newest - don't toast old history
      isFirstRender.current = false;
      lastSeenId.current = newest._id;
      return;
    }

    if (newest._id !== lastSeenId.current) {
      lastSeenId.current = newest._id;
      setToast(newest);
    }
  }, [newest]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed right-6 top-20 z-50 w-80 animate-[fadeIn_0.2s_ease-out] rounded-xl border border-blue-200 bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
