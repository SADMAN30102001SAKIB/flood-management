'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const res = await fetch('/api/notifications?limit=10');
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch on mount and when opening dropdown
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!session) return null;

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_assigned':
        return '📋';
      case 'request_updated':
        return '🔄';
      case 'account_approved':
        return '✅';
      case 'account_rejected':
        return '❌';
      case 'broadcast':
        return '📢';
      default:
        return '🔔';
    }
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read-btn">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    if (notification.link) {
                      router.push(notification.link);
                    }
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{getTimeAgo(notification.createdAt)}</div>
                  </div>
                  {!notification.isRead && <div className="notification-dot"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .notification-bell-container {
          position: relative;
        }

        .notification-bell-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .notification-bell-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #e53935;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .mark-all-read-btn {
          background: none;
          border: none;
          color: #2196f3;
          cursor: pointer;
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .mark-all-read-btn:hover {
          background-color: #e3f2fd;
        }

        .notification-list {
          overflow-y: auto;
          max-height: 400px;
        }

        .notification-loading,
        .notification-empty {
          padding: 32px;
          text-align: center;
          color: #666;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background-color: #f5f5f5;
        }

        .notification-item.unread {
          background-color: #e3f2fd;
        }

        .notification-item.unread:hover {
          background-color: #bbdefb;
        }

        .notification-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .notification-message {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-time {
          color: #999;
          font-size: 12px;
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background-color: #2196f3;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .notification-footer {
          padding: 12px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
        }

        .notification-footer a {
          color: #2196f3;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .notification-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: 320px;
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
