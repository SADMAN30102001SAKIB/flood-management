'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';

export default function VolunteerDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
  }, [session, filters]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);

      const res = await fetch(`/api/requests?${params.toString()}`);
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
    if (!confirm('Accept this request?')) return;

    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId: session.user.id })
      });

      const data = await res.json();
      if (data.success) {
        alert('Request accepted successfully!');
        fetchRequests();
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
        fetchRequests();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
  };

  const getPriorityBadge = (priority) => {
    return <span className={`badge badge-${priority}`}>{priority}</span>;
  };

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Volunteer Dashboard</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Filters</h3>
        <div className="grid grid-cols-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All</option>
              <option value="rescue">Rescue</option>
              <option value="medical">Medical</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
              <option value="shelter">Shelter</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Incoming Requests</h2>
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#6b7280' }}>No requests found matching your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((req) => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>{req.type}</span>
                      {getPriorityBadge(req.priority)}
                      {getStatusBadge(req.status)}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{req.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '12px' }}>{req.description}</p>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <p><strong>Requester:</strong> {req.userId?.name} | {req.userId?.phone}</p>
                      <p><strong>Location:</strong> {req.address?.city}, {req.address?.district}, {req.address?.division}</p>
                      <p><strong>Created:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                      {req.assignedVolunteerId && (
                        <p><strong>Assigned To:</strong> {req.assignedVolunteerId?.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {req.status === 'pending' && (
                    <button className="btn btn-success" onClick={() => handleAccept(req._id)}>
                      Accept Request
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
      </div>
    </DashboardLayout>
  );
}
