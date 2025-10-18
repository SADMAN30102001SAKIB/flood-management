'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getRoleLabel = (role) => {
    const labels = {
      'user': 'User',
      'volunteer': 'Volunteer',
      'emergency_volunteer': 'Emergency Volunteer',
      'admin': 'Administrator'
    };
    return labels[role] || role;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Top Navigation */}
      <nav style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/dashboard">
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>🌊 Flood Relief</h2>
              </Link>
              <span className="badge badge-primary" style={{ background: '#dbeafe', color: '#1e40af' }}>
                {getRoleLabel(session.user.role)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <NotificationBell />
              <span style={{ color: '#6b7280' }}>{session.user.name}</span>
              <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '32px 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
