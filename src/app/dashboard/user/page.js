'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    address: {
      street: '',
      city: '',
      district: '',
      division: '',
      postalCode: '',
      landmark: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session) {
      fetchMyRequests();
    }
  }, [session]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/requests');
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

  const handleRequestTypeClick = (type) => {
    setRequestType(type);
    setFormData({ ...formData, type });
    setShowRequestModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess('Request submitted successfully!');
      setShowRequestModal(false);
      fetchMyRequests();
      
      // Reset form
      setFormData({
        type: '',
        title: '',
        description: '',
        priority: 'medium',
        address: {
          street: '',
          city: '',
          district: '',
          division: '',
          postalCode: '',
          landmark: ''
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>User Dashboard</h1>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Request Help Options */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Request Help</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#dc2626' }}>🚨 Emergency Help</h3>
        <div className="grid grid-cols-3" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('rescue')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚤</div>
            <h4 style={{ fontWeight: '600' }}>Rescue</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Evacuation & boat support</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('medical')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏥</div>
            <h4 style={{ fontWeight: '600' }}>Medical</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Doctor, ambulance, first aid</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('other')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <h4 style={{ fontWeight: '600' }}>Others</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Food, water, supplies</p>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>🏠 Shelter Help</h3>
        <div className="grid grid-cols-3">
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('shelter')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏕️</div>
            <h4 style={{ fontWeight: '600' }}>Shelter</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Temporary accommodation</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('food')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍚</div>
            <h4 style={{ fontWeight: '600' }}>Food</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Meals & nutrition</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRequestTypeClick('clothes')}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👕</div>
            <h4 style={{ fontWeight: '600' }}>Clothing</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Clothes & blankets</p>
          </div>
        </div>
      </div>

      {/* My Requests */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>My Requests</h2>
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#6b7280' }}>No requests yet. Submit a request above to get help.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.type}</td>
                    <td>{req.title}</td>
                    <td>{getPriorityBadge(req.priority)}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>{req.assignedVolunteerId?.name || 'Unassigned'}</td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Submit {requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request</h2>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required placeholder="Brief description of your need" />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange} required placeholder="Provide detailed information about your situation..." />
              </div>

              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '20px', marginBottom: '12px' }}>Location</h4>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Street/Village</label>
                  <input type="text" name="address.street" className="form-input" value={formData.address.street} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" name="address.city" className="form-input" value={formData.address.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input type="text" name="address.district" className="form-input" value={formData.address.district} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Division *</label>
                  <input type="text" name="address.division" className="form-input" value={formData.address.division} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input type="text" name="address.landmark" className="form-input" value={formData.address.landmark} onChange={handleChange} placeholder="Nearest landmark" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
