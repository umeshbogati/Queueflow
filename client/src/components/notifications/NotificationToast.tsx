import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

// Toast for notifications that arrive LIVE via socket.
// The slice stores each socket arrival in `lastLive`; REST history loads
// never touch it - so freshly loaded history can never swallow a toast
// (the old bug: first live notification was mistaken for history).
//
// The visible toast is DERIVED from `lastLive` instead of copied into
// another state inside an effect (avoids cascading renders): it shows
// the newest live notification until the user dismisses it or 5s pass.
const NotificationToast = () => {
  const live = useAppSelector((state) => state.notification.lastLive);

  // id of the notification the user closed / that auto-dismissed
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const toast = live && dismissedId !== live._id ? live : null;

  // Auto-dismiss after 5 seconds (setState inside a timer callback,
  // not synchronously in the effect body)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(
      () => setDismissedId(toast._id),
      5000
    );
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
          onClick={() => setDismissedId(toast._id)}
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
