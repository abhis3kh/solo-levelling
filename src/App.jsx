import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import AuthPage from "./AuthPage.jsx";
import DashboardPage from "./DashboardPage.jsx";
import { getSession, logoutUser } from "./lib/api.js";

const INITIAL_SESSION = {
  loading: true,
  user: null,
  profile: null,
};

export default function App() {
  const [session, setSession] = useState(INITIAL_SESSION);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      try {
        const payload = await getSession();
        if (mounted) {
          setSession({
            loading: false,
            user: payload.user,
            profile: payload.profile,
          });
        }
      } catch (error) {
        if (mounted) {
          setSession({
            loading: false,
            user: null,
            profile: null,
          });
        }
      }
    }

    void bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  function applySessionPayload(payload) {
    setSession({
      loading: false,
      user: payload.user,
      profile: payload.profile,
    });
  }

  async function handleLogout() {
    await logoutUser();
    setSession({
      loading: false,
      user: null,
      profile: null,
    });
  }

  if (session.loading) {
    return (
      <main className="loading-screen">
        <div className="loading-card panel">
          <p className="eyebrow">Ascension System</p>
          <h1>Loading your profile...</h1>
          <p>Preparing quests, stats, and daily progression.</p>
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session.user ? (
            <Navigate replace to="/app" />
          ) : (
            <AuthPage mode="login" onSuccess={applySessionPayload} />
          )
        }
      />
      <Route
        path="/register"
        element={
          session.user ? (
            <Navigate replace to="/app" />
          ) : (
            <AuthPage mode="register" onSuccess={applySessionPayload} />
          )
        }
      />
      <Route
        path="/app"
        element={
          session.user && session.profile ? (
            <DashboardPage
              profile={session.profile}
              user={session.user}
              onLogout={handleLogout}
              onSessionChange={applySessionPayload}
            />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate replace to={session.user ? "/app" : "/login"} />} />
    </Routes>
  );
}
