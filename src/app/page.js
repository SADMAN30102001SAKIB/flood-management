'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  const handleQuickHelp = () => {
    if (session) {
      router.push('/dashboard/user');
    } else {
      setShowQuickHelp(true);
    }
  };

  return (
    <div className={styles.homepage}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navContent}>
            <div className={styles.logo}>
              <h2>🌊 Flood Relief</h2>
            </div>
            <div className={styles.navLinks}>
              {session ? (
                <>
                  <Link href="/dashboard" className="btn btn-primary">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Flood Relief Management System
            </h1>
            <p className={styles.heroSubtitle}>
              Coordinating help for flood-affected communities. Request assistance, volunteer your time, or manage relief operations.
            </p>
            <div className={styles.heroCta}>
              <button onClick={handleQuickHelp} className="btn btn-danger" style={{ marginRight: '16px' }}>
                🆘 Request Help Now
              </button>
              <Link href="/signup" className="btn btn-primary">
                Join as Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Guidelines Section */}
      <section className={styles.guidelines}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Emergency Guidelines / জরুরি নির্দেশিকা</h2>
          
          <div className="grid grid-cols-2">
            {/* English */}
            <div className="card">
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>🇬🇧 English</h3>
              <div className={styles.guidelineList}>
                <div className={styles.guidelineItem}>
                  <strong>1. Stay Calm & Stay Safe</strong>
                  <p>Move to higher ground immediately. Avoid walking or driving through floodwater.</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>2. Emergency Numbers</strong>
                  <p>Fire Service: 999 | Police: 999 | Ambulance: 999</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>3. Prepare Emergency Kit</strong>
                  <p>Keep food, water, medicines, flashlight, and important documents in waterproof bags.</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>4. Communication</strong>
                  <p>Keep your phone charged. Inform family members of your location.</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>5. Request Help</strong>
                  <p>Use this platform to request rescue, medical aid, food, or shelter assistance.</p>
                </div>
              </div>
            </div>

            {/* Bangla */}
            <div className="card">
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>🇧🇩 বাংলা</h3>
              <div className={styles.guidelineList}>
                <div className={styles.guidelineItem}>
                  <strong>১. শান্ত থাকুন এবং নিরাপদে থাকুন</strong>
                  <p>অবিলম্বে উঁচু জায়গায় চলে যান। বন্যার পানিতে হাঁটা বা গাড়ি চালানো থেকে বিরত থাকুন।</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>২. জরুরি নম্বর</strong>
                  <p>ফায়ার সার্ভিস: ৯৯৯ | পুলিশ: ৯৯৯ | অ্যাম্বুলেন্স: ৯৯৯</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>৩. জরুরি কিট প্রস্তুত করুন</strong>
                  <p>খাবার, পানি, ওষুধ, টর্চলাইট এবং গুরুত্বপূর্ণ কাগজপত্র জলরোধী ব্যাগে রাখুন।</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>৪. যোগাযোগ</strong>
                  <p>আপনার ফোন চার্জ রাখুন। পরিবারের সদস্যদের আপনার অবস্থান জানান।</p>
                </div>
                <div className={styles.guidelineItem}>
                  <strong>৫. সাহায্যের অনুরোধ</strong>
                  <p>উদ্ধার, চিকিৎসা সহায়তা, খাদ্য বা আশ্রয়ের জন্য এই প্ল্যাটফর্ম ব্যবহার করুন।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First Aid Section */}
      <section className={styles.firstAid}>
        <div className="container">
          <div className="card">
            <h2 className={styles.cardTitle}>🏥 First Aid & Medical Tips</h2>
            <div className={styles.guidelineList}>
              <div className={styles.guidelineItem}>
                <strong>Clean Water</strong>
                <p>Boil water for at least 1 minute before drinking. Use water purification tablets if available.</p>
              </div>
              <div className={styles.guidelineItem}>
                <strong>Wound Care</strong>
                <p>Clean cuts immediately with clean water. Apply antiseptic and cover with clean bandage.</p>
              </div>
              <div className={styles.guidelineItem}>
                <strong>Prevent Diseases</strong>
                <p>Wash hands frequently. Avoid contact with floodwater. Get vaccinated if recommended.</p>
              </div>
              <div className={styles.guidelineItem}>
                <strong>Emergency Symptoms</strong>
                <p>Seek immediate medical help for: high fever, severe diarrhea, difficulty breathing, chest pain.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className="grid grid-cols-3">
            <div className="card">
              <div className={styles.featureIcon}>👥</div>
              <h3>For Users</h3>
              <p>Request help for rescue, medical, food, clothing, or shelter needs. Track your request status in real-time.</p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>🤝</div>
              <h3>For Volunteers</h3>
              <p>View and accept requests in your area. Help those in need with rescue, medical aid, food distribution, and more.</p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>⚡</div>
              <h3>Emergency Response</h3>
              <p>Emergency volunteers can respond to urgent, life-threatening situations with priority access to critical requests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>&copy; 2025 Flood Relief Management System. All rights reserved.</p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
            Emergency: 999 | Email: support@floodrelief.com
          </p>
        </div>
      </footer>

      {/* Quick Help Modal */}
      {showQuickHelp && (
        <div className="modal-overlay" onClick={() => setShowQuickHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Help</h2>
              <button className="modal-close" onClick={() => setShowQuickHelp(false)}>&times;</button>
            </div>
            <div className="alert alert-warning">
              <p><strong>Please sign in to submit a help request.</strong></p>
              <p style={{ marginTop: '8px' }}>Create an account to request rescue, medical aid, food, shelter, or other assistance.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Link href="/signup" className="btn btn-primary" style={{ flex: 1 }}>
                Sign Up
              </Link>
              <Link href="/login" className="btn btn-outline" style={{ flex: 1 }}>
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
