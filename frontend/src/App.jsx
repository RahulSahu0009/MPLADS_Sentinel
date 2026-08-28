// App.jsx — route tree for MPLADS Sentinel.
// Changes from original stub:
//   1. Imported AppLayout and all page components.
//   2. Added all routes under AppLayout (protected layout shell).
//   3. /login is rendered outside AppLayout (no sidebar/header needed).
//   4. / redirects to /dashboard via Navigate.
//   5. Catch-all * redirects to /dashboard.
// NOTE: Full auth-guard (ProtectedRoute) is not yet implemented — routes are
// accessible without a token at this stage. Wire ProtectedRoute once the auth
// context/hook is confirmed by the team.

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StateAnalysisPage from './pages/StateAnalysisPage';
import DistrictAnalysisPage from './pages/DistrictAnalysisPage';

const SPLASH_VISIBLE_MS = 1400;
const SPLASH_EXIT_MS = 400;

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setSplashExiting(true), SPLASH_VISIBLE_MS);
    const hideTimer = setTimeout(() => setSplashVisible(false), SPLASH_VISIBLE_MS + SPLASH_EXIT_MS);
    return () => { clearTimeout(exitTimer); clearTimeout(hideTimer); };
  }, []);

  return (
    <>
      {splashVisible && <SplashScreen exiting={splashExiting} />}
      <BrowserRouter>
      <Routes>
        {/* Public route — no layout shell */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped in AppLayout */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/projects"
          element={
            <AppLayout>
              <ProjectsPage />
            </AppLayout>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <AppLayout>
              <ProjectDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <AppLayout>
              <AlertsPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics/state"
          element={
            <AppLayout>
              <StateAnalysisPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics/district"
          element={
            <AppLayout>
              <DistrictAnalysisPage />
            </AppLayout>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
