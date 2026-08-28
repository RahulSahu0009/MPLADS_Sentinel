// SplashScreen.jsx
// Shown once on initial application load. Fades out automatically.
// Props:
//   exiting {boolean} — triggers the fade-out animation class
//
// NOTE: No official MPLADS logo asset was found in the repository.
// Replace the SVG placeholder below with the official logo once available.
// Suggested path: frontend/public/mplads-logo.png
// Usage: <img src="/mplads-logo.png" alt="MPLADS" className="splash-logo w-20 h-20 object-contain" />

export default function SplashScreen({ exiting }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white ${exiting ? 'splash-exit pointer-events-none' : ''}`}
    >
      {/* Logo area — replace with official asset when available */}
      <div className="splash-logo mb-6">
        <div className="w-20 h-20 rounded-2xl bg-blue-700 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11" aria-hidden="true">
            {/* Stylised "S" mark representing Sentinel */}
            <rect x="10" y="8"  width="28" height="5" rx="2.5" fill="white" opacity="0.95"/>
            <rect x="10" y="21.5" width="28" height="5" rx="2.5" fill="white" opacity="0.85"/>
            <rect x="10" y="35" width="28" height="5" rx="2.5" fill="white" opacity="0.75"/>
            <rect x="10" y="8"  width="5"  height="18.5" rx="2.5" fill="white" opacity="0.95"/>
            <rect x="33" y="21.5" width="5" height="18.5" rx="2.5" fill="white" opacity="0.75"/>
          </svg>
        </div>
      </div>

      {/* Primary title */}
      <h1 className="splash-title text-2xl font-bold tracking-widest text-gray-900 uppercase">
        MPLADS Sentinel
      </h1>

      {/* Subtitle */}
      <p className="splash-sub mt-2 text-sm font-medium tracking-wide text-blue-600">
        AI-Powered Development Monitoring
      </p>

      {/* Thin accent line */}
      <div className="splash-sub mt-6 w-16 h-0.5 rounded-full bg-blue-200" />
    </div>
  );
}
