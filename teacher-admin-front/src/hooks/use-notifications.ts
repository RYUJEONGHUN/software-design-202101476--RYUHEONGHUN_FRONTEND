import { useEffect, useMemo, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  getUnreadNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/api/notification";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const fetchUnread = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUnreadNotifications();

      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sorted);
    } catch (err) {
      console.error(err);
      setError("알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = async () => {
    const token = getAccessToken();
    if (!token) return;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await fetchEventSource(`${API_BASE_URL}/api/v1/notifications/subscribe`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
        openWhenHidden: true,

        onopen: async (response) => {
        if (!response.ok) {
            throw new Error("SSE 연결에 실패했습니다.");
        }            
        },

        onmessage(event) {
          if (event.event === "connect") return;

          if (event.event === "notification") {
            try {
              const parsed: NotificationItem = JSON.parse(event.data);

              setNotifications((prev) => {
                const exists = prev.some((item) => item.id === parsed.id);
                if (exists) return prev;

                return [parsed, ...prev].sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              });
            } catch (err) {
              console.error("알림 파싱 실패:", err, event.data);
            }
          }
        },

        onerror(err) {
          console.error("SSE error:", err);
          throw err;
        },
      });
    } catch (err) {
      console.error("SSE 연결 종료:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
  try {
    await markNotificationAsRead(notificationId);

    setNotifications((prev) =>
      prev.filter((item) => item.id !== notificationId)
    );
  } catch (err) {
    console.error(err);
  }
  };

  const handleMarkAllAsReadLocal = async () => {
  const unreadIds = notifications.map((item) => item.id);

  for (const id of unreadIds) {
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);
    }
  }

  setNotifications([]);
 };

  useEffect(() => {
    fetchUnread();
    connectSSE();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchUnread,
    handleMarkAsRead,
    handleMarkAllAsReadLocal,
  };
}
