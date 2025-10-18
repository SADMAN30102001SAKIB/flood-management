'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';

export default function EmergencyVolunteerDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchUrgentRequests();
    }
  }, [session]);

  const fetchUrgentRequests = async () => {
    try {
      const res = await fetch('/api/requests?priority=urgent&priority=high');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Accept this urgent request?')) return;

    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId: session.user.id })
      });

      const data = await res.json();
      if (data.success) {
        alert('Request accepted! Please respond immediately.');
        fetchUrgentRequests();
      } else {
        alert(data.error || 'Failed to accept request');
      }
    } catch (err) {
      alert('Error accepting request');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        alert('Status updated successfully!');
        fetchUrgentRequests();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Emergency Volunteer Dashboard</h1>
      <p style={{ color: '#dc2626', marginBottom: '24px', fontSize: '16px' }}>⚡ Responding to urgent and high-priority requests</p>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No Urgent Requests</h3>
          <p style={{ color: '#6b7280' }}>There are currently no urgent or high-priority requests in your area.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div key={req._id} className="card" style={{ borderLeft: req.priority === 'urgent' ? '4px solid #dc2626' : '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge" style={{ background: '#fee2e2', color: '#7f1d1d' }}>{req.type}</span>
                    <span className={`badge badge-${req.priority}`}>{req.priority}</span>
                    <span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ')}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{req.title}</h3>
                  <p style={{ color: '#374151', marginBottom: '12px', fontWeight: '500' }}>{req.description}</p>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <p><strong>Requester:</strong> {req.userId?.name}</p>
                    <p><strong>Phone:</strong> {req.userId?.phone}</p>
                    <p><strong>Location:</strong> {req.address?.landmark ? `${req.address.landmark}, ` : ''}{req.address?.city}, {req.address?.district}</p>
                    <p><strong>Time:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {req.status === 'pending' && (
                  <button className="btn btn-danger" onClick={() => handleAccept(req._id)}>
                    🚨 Accept Emergency
                  </button>
                )}
                {req.assignedVolunteerId?._id === session?.user?.id && req.status === 'assigned' && (
                  <button className="btn btn-primary" onClick={() => handleUpdateStatus(req._id, 'in_progress')}>
                    Mark In Progress
                  </button>
                )}
                {req.assignedVolunteerId?._id === session?.user?.id && req.status === 'in_progress' && (
                  <button className="btn btn-success" onClick={() => handleUpdateStatus(req._id, 'completed')}>
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
