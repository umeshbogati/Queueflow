import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, CheckCheck, Ticket, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
} from "../../store/slices/notificationSlice";
import type { Notification } from "../../api/notificationApi";
import NotificationToast from "./NotificationToast";

// Small helper: "just now" / "5m ago" / "2h ago" / "3d ago"
const timeAgo = (isoDate: string): string => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Icon + color per notification type
const typeStyle = (type: Notification["type"]) => {
  switch (type) {
    case "queue_created":
      return { Icon: Ticket, classes: "bg-emerald-100 text-emerald-600" };
    case "queue_called":
      return { Icon: BellRing, classes: "bg-blue-100 text-blue-600" };
    case "queue_serving":
      return { Icon: Bell, classes: "bg-purple-100 text-purple-600" };
    case "queue_completed":
      return { Icon: CheckCheck, classes: "bg-green-100 text-green-600" };
    default: // queue_cancelled
      return { Icon: X, classes: "bg-red-100 text-red-600" };
  }
};

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { items, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id ?? user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load history + badge count when the bell mounts or the logged-in
  // user changes (covers page refreshes and cross-tab account switches -
  // socket events handle everything after that)
  useEffect(() => {
    // reset list when logging out or switching accounts in another tab
    dispatch(clearNotifications());

    if (!userId) return;

    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch, userId]);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (notification: Notification) => {
    // clicking an unread item marks it read (server + redux)
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }
  };

  return (
    <>
      {/* Live toast popup - shows whenever a new notification arrives */}
      <NotificationToast />

      <div className="relative" ref={panelRef}>
        {/* Bell button with unread badge */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold text-gray-800">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading...
                </p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">
                  No notifications yet
                </p>
              ) : (
                items.map((notification) => {
                  const { Icon, classes } = typeStyle(notification.type);
                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleItemClick(notification)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                        // unread rows get a light highlight
                        notification.isRead ? "" : "bg-blue-50/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${classes}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-gray-800">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </span>
                        <span className="block truncate text-sm text-gray-600">
                          {notification.message}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-400">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
