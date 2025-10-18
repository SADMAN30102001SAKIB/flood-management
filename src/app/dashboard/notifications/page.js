'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filter === 'unread') {
        params.append('unreadOnly', 'true');
      } else if (filter === 'read') {
        params.append('readOnly', 'true');
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      broadcast: '📢',
      request_assigned: '📋',
      request_updated: '🔄',
      account_approved: '✅',
      account_rejected: '❌',
      general: '📌',
    };
    return icons[type] || '🔔';
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            🔔 Notifications
          </h1>
          <p style={{ color: '#6b7280' }}>Stay updated with all your notifications</p>
        </div>

        {/* Filters and Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              style={{
                padding: '8px 16px',
                border: filter === 'all' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '6px',
                background: filter === 'all' ? '#eff6ff' : 'white',
                color: filter === 'all' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: filter === 'all' ? '600' : '400',
              }}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              style={{
                padding: '8px 16px',
                border: filter === 'unread' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '6px',
                background: filter === 'unread' ? '#eff6ff' : 'white',
                color: filter === 'unread' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: filter === 'unread' ? '600' : '400',
              }}
            >
              Unread
            </button>
            <button
              onClick={() => { setFilter('read'); setPage(1); }}
              style={{
                padding: '8px 16px',
                border: filter === 'read' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '6px',
                background: filter === 'read' ? '#eff6ff' : 'white',
                color: filter === 'read' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontWeight: filter === 'read' ? '600' : '400',
              }}
            >
              Read
            </button>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              No notifications
            </h3>
            <p style={{ color: '#6b7280' }}>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  background: notification.isRead ? 'white' : '#eff6ff',
                  border: notification.isRead ? '1px solid #e5e7eb' : '2px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: notification.link ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'start',
                }}
                onMouseEnter={(e) => {
                  if (notification.link) {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (notification.link) {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ fontSize: '32px', flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start',
                    marginBottom: '4px'
                  }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: notification.isRead ? '500' : '700',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '600',
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: '4px 0 8px 0',
                    lineHeight: '1.5'
                  }}>
                    {notification.message}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>{formatDate(notification.createdAt)}</span>
                    {notification.link && (
                      <span style={{ color: '#3b82f6', fontWeight: '500' }}>
                        View Details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '12px',
            marginTop: '32px'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                background: page === 1 ? '#f3f4f6' : '#3b82f6',
                color: page === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              ← Previous
            </button>
            <span style={{ color: '#6b7280' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px',
                background: page === totalPages ? '#f3f4f6' : '#3b82f6',
                color: page === totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
