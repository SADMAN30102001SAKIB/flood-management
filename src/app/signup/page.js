'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: role selection, 2: form
  const [role, setRole] = useState('');
  const [volunteerType, setVolunteerType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    profession: '',
    phone: '',
    nid: '',
    sector: '',
    experience: '',
    address: {
      street: '',
      city: '',
      district: '',
      division: '',
      postalCode: '',
      nearestLandmark: ''
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole, volType = null) => {
    setRole(selectedRole);
    setVolunteerType(volType);
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const submitData = {
      ...formData,
      role: role === 'volunteer' ? (volunteerType === 'emergency' ? 'emergency_volunteer' : 'volunteer') : 'user',
      volunteerType
    };

    delete submitData.confirmPassword;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                Registration Successful!
              </h1>
              <div className="alert alert-warning">
                <p><strong>Pending Admin Approval</strong></p>
                <p style={{ marginTop: '8px' }}>Your account is currently pending approval. An administrator will review your application and you will be notified via email once approved.</p>
                <p style={{ marginTop: '12px', fontSize: '14px' }}>Estimated wait time: 24-48 hours</p>
              </div>
              <div style={{ marginTop: '24px' }}>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>Need help? Contact support@floodrelief.com</p>
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div style={{ width: '100%', maxWidth: '600px', margin: '20px' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                Join Flood Relief
              </h1>
              <p style={{ color: '#6b7280' }}>Choose your role to get started</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                className="card" 
                style={{ cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}
                onClick={() => handleRoleSelect('user')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>👤</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>User</h3>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Request help for rescue, medical aid, food, shelter, and other needs</p>
              </div>

              <div 
                className="card" 
                style={{ cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}
                onClick={() => handleRoleSelect('volunteer', 'permanent')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🤝</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Permanent Volunteer</h3>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Join as a long-term volunteer to help with organized relief operations</p>
              </div>

              <div 
                className="card" 
                style={{ cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}
                onClick={() => handleRoleSelect('volunteer', 'emergency')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>⚡</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Emergency Volunteer</h3>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Respond to urgent, life-threatening situations in your area</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href="/login" style={{ color: '#6b7280' }}>
                Already have an account? <span style={{ color: '#2563eb', fontWeight: '600' }}>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card">
          <div style={{ marginBottom: '32px' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px' }}>
              ← Change Role
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginTop: '12px' }}>
              {role === 'user' ? 'User Registration' : `${volunteerType === 'emergency' ? 'Emergency' : 'Permanent'} Volunteer Registration`}
            </h1>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
                <p className="form-error" style={{ color: '#6b7280', fontSize: '12px' }}>Min 6 chars, 1 uppercase, 1 lowercase, 1 number</p>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" />
              </div>

              {role === 'user' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" name="age" className="form-input" value={formData.age} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Profession</label>
                    <input type="text" name="profession" className="form-input" value={formData.profession} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NID Number</label>
                    <input type="text" name="nid" className="form-input" value={formData.nid} onChange={handleChange} />
                  </div>
                </>
              )}

              {role === 'volunteer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Sector *</label>
                    <select name="sector" className="form-select" value={formData.sector} onChange={handleChange} required>
                      <option value="">Select Sector</option>
                      <option value="medical">Medical</option>
                      <option value="rescue">Rescue</option>
                      <option value="logistics">Logistics</option>
                      <option value="food">Food Distribution</option>
                      <option value="shelter">Shelter Management</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Experience</label>
                    <textarea name="experience" className="form-textarea" value={formData.experience} onChange={handleChange} placeholder="Describe your relevant experience..."></textarea>
                  </div>
                </>
              )}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '24px', marginBottom: '16px' }}>Address Information</h3>
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
                <select name="address.division" className="form-select" value={formData.address.division} onChange={handleChange} required>
                  <option value="">Select Division</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input type="text" name="address.postalCode" className="form-input" value={formData.address.postalCode} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Nearest Landmark</label>
                <input type="text" name="address.nearestLandmark" className="form-input" value={formData.address.nearestLandmark} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
