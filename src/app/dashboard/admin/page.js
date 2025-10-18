'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [shelterForm, setShelterForm] = useState({
    name: '',
    capacity: '',
    address: { city: '', district: '', division: '', street: '', landmark: '' },
    contact: { phone: '', email: '' }
  });
  const [broadcastForm, setBroadcastForm] = useState({ message: '', audience: 'all' });

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchShelters();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?status=pending');
      const data = await res.json();
      if (data.success) setPendingUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
    }
  };

  const fetchShelters = async () => {
    try {
      const res = await fetch('/api/admin/shelters');
      const data = await res.json();
      if (data.success) setShelters(data.shelters);
    } catch (err) {
      console.error('Failed to fetch shelters:', err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('User approved successfully!');
        fetchPendingUsers();
        fetchStats();
      }
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Reject this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('User rejected');
        fetchPendingUsers();
      }
    } catch (err) {
      alert('Error rejecting user');
    }
  };

  const handleCreateShelter = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shelters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shelterForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Shelter created!');
        setShowShelterModal(false);
        fetchShelters();
        setShelterForm({ name: '', capacity: '', address: { city: '', district: '', division: '', street: '', landmark: '' }, contact: { phone: '', email: '' } });
      }
    } catch (err) {
      alert('Error creating shelter');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Broadcast sent successfully!');
        setShowBroadcastModal(false);
        setBroadcastForm({ message: '', audience: 'all' });
      }
    } catch (err) {
      alert('Error sending broadcast');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading"><div className="spinner"></div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
          📢 Broadcast Notification
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
        {['overview', 'approvals', 'shelters'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === tab ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '-2px'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-4" style={{ marginBottom: '32px' }}>
            <div className="stat-card" style={{ borderLeftColor: '#2563eb' }}>
              <div className="stat-card-value">{stats.users.total}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#16a34a' }}>
              <div className="stat-card-value">{stats.users.volunteers}</div>
              <div className="stat-card-label">Volunteers</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="stat-card-value">{stats.users.pendingApprovals}</div>
              <div className="stat-card-label">Pending Approvals</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
              <div className="stat-card-value">{stats.shelters.active}</div>
              <div className="stat-card-label">Active Shelters</div>
            </div>
          </div>

          <div className="grid grid-cols-4" style={{ marginBottom: '32px' }}>
            <div className="stat-card" style={{ borderLeftColor: '#dc2626' }}>
              <div className="stat-card-value">{stats.requests.pending}</div>
              <div className="stat-card-label">Pending Requests</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#2563eb' }}>
              <div className="stat-card-value">{stats.requests.assigned}</div>
              <div className="stat-card-label">Assigned</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="stat-card-value">{stats.requests.inProgress}</div>
              <div className="stat-card-label">In Progress</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#16a34a' }}>
              <div className="stat-card-value">{stats.requests.completed}</div>
              <div className="stat-card-label">Completed</div>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Requests by Type</h2>
          <div className="card">
            <div className="grid grid-cols-3">
              {stats.requests.byType.map((item) => (
                <div key={item._id} style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{item.count}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>{item._id}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            Pending Approvals ({pendingUsers.length})
          </h2>
          {pendingUsers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280' }}>No pending approvals</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingUsers.map((user) => (
                <div key={user._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>{user.role}</span>
                        {user.volunteerType && <span className="badge" style={{ marginLeft: '8px', background: '#e0e7ff', color: '#3730a3' }}>{user.volunteerType}</span>}
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{user.name}</h4>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {user.email} | {user.phone} | {user.address?.district}, {user.address?.division}
                      </p>
                      {user.sector && <p style={{ fontSize: '14px', color: '#6b7280' }}><strong>Sector:</strong> {user.sector}</p>}
                      {user.experience && <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}><strong>Experience:</strong> {user.experience}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-success" onClick={() => handleApprove(user._id)}>
                        Approve
                      </button>
                      <button className="btn btn-danger" onClick={() => handleReject(user._id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Shelters Tab */}
      {activeTab === 'shelters' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Shelters ({shelters.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowShelterModal(true)}>
              + Add Shelter
            </button>
          </div>
          <div className="grid grid-cols-2">
            {shelters.map((shelter) => (
              <div key={shelter._id} className="card">
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{shelter.name}</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  {shelter.address?.city}, {shelter.address?.district}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>
                      {shelter.currentOccupancy}/{shelter.capacity}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Occupancy</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>
                      {shelter.capacity - shelter.currentOccupancy}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Available</div>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Contact:</strong> {shelter.contact?.phone}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shelter Modal */}
      {showShelterModal && (
        <div className="modal-overlay" onClick={() => setShowShelterModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Shelter</h2>
              <button className="modal-close" onClick={() => setShowShelterModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateShelter}>
              <div className="form-group">
                <label className="form-label">Shelter Name *</label>
                <input type="text" className="form-input" value={shelterForm.name} onChange={(e) => setShelterForm({ ...shelterForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input type="number" className="form-input" value={shelterForm.capacity} onChange={(e) => setShelterForm({ ...shelterForm, capacity: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-input" value={shelterForm.address.city} onChange={(e) => setShelterForm({ ...shelterForm, address: { ...shelterForm.address, city: e.target.value } })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input type="text" className="form-input" value={shelterForm.address.district} onChange={(e) => setShelterForm({ ...shelterForm, address: { ...shelterForm.address, district: e.target.value } })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Division *</label>
                <input type="text" className="form-input" value={shelterForm.address.division} onChange={(e) => setShelterForm({ ...shelterForm, address: { ...shelterForm.address, division: e.target.value } })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input type="tel" className="form-input" value={shelterForm.contact.phone} onChange={(e) => setShelterForm({ ...shelterForm, contact: { ...shelterForm.contact, phone: e.target.value } })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Shelter</button>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Broadcast Notification</h2>
              <button className="modal-close" onClick={() => setShowBroadcastModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleBroadcast}>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-textarea" value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} required placeholder="Enter broadcast message..." />
              </div>
              <div className="form-group">
                <label className="form-label">Audience *</label>
                <select className="form-select" value={broadcastForm.audience} onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}>
                  <option value="all">All Users</option>
                  <option value="volunteers">All Volunteers</option>
                  <option value="users">All Users Only</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
