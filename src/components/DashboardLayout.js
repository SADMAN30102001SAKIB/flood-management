"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getRoleLabel = role => {
    const labels = {
      user: "User",
      volunteer: "Volunteer",
      emergency_volunteer: "Emergency Volunteer",
      admin: "Administrator",
    };
    return labels[role] || role;
  };

  const getUserInitials = name => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Top Navigation */}
      <nav
        style={{
          background: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link href="/dashboard">
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}>
                  🌊 Flood Relief
                </h2>
              </Link>
              <span
                className="badge badge-primary"
                style={{ background: "#dbeafe", color: "#1e40af" }}>
                {getRoleLabel(session.user.role)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <NotificationBell />
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}>
                  {getUserInitials(session.user.name)}
                </div>
                <span style={{ color: "#6b7280" }}>{session.user.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ padding: "8px 16px" }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: "32px 0", minHeight: "calc(100vh - 200px)" }}>
        <div className="container">{children}</div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "24px 0",
          marginTop: "48px",
        }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              © {new Date().getFullYear()} Flood Relief Management System
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
              <Link href="/dashboard" style={{ color: "#2563eb" }}>
                Dashboard
              </Link>
              <Link
                href="/dashboard/notifications"
                style={{ color: "#2563eb" }}>
                Notifications
              </Link>
              <a
                href="https://github.com/SADMAN30102001SAKIB/flood-management"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563eb" }}>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
