"use client";

/**
 * LoadingSpinner Component
 * Reusable loading indicator for async operations
 */
export default function LoadingSpinner({ size = "medium", text = "" }) {
  const sizes = {
    small: "24px",
    medium: "40px",
    large: "64px",
  };

  const spinnerSize = sizes[size] || sizes.medium;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "20px",
      }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {text && <p style={{ color: "#6b7280", fontSize: "14px" }}>{text}</p>}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * FullPageLoader - Loading screen that covers the entire viewport
 */
export function FullPageLoader({ text = "Loading..." }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}>
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}

/**
 * InlineLoader - Small loader for inline use (buttons, cards, etc.)
 */
export function InlineLoader({ text = "" }) {
  return <LoadingSpinner size="small" text={text} />;
}
