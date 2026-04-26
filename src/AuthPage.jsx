import { useState } from "react";
import { Link } from "react-router-dom";

import { loginUser, registerUser } from "./lib/api.js";

const AUTH_COPY = {
  login: {
    title: "Sign in",
    subtitle: "Return to your quests, stats, and daily progression.",
    submitLabel: "Enter the system",
    alternateLabel: "Need an account?",
    alternateLink: "/register",
    alternateAction: "Create one",
  },
  register: {
    title: "Create account",
    subtitle: "Start a profile with personal quests, progression, and streaks.",
    submitLabel: "Register and begin",
    alternateLabel: "Already have an account?",
    alternateLink: "/login",
    alternateAction: "Sign in",
  },
};

export default function AuthPage({ mode, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const copy = AUTH_COPY[mode];

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (mode === "register") {
      if (form.name.trim().length < 2) {
        setError("Name must be at least 2 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setPending(true);

    try {
      const payload = mode === "register"
        ? await registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
          })
        : await loginUser({
            email: form.email,
            password: form.password,
          });

      onSuccess(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="auth-shell">
      <section className="auth-card panel">
        <div className="auth-hero">
          <p className="eyebrow">Ascension System</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label>
              Name
              <input
                autoComplete="name"
                disabled={pending}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your hunter name"
                required
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              autoComplete="email"
              disabled={pending}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              disabled={pending}
              minLength={8}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={form.password}
            />
          </label>

          {mode === "register" ? (
            <label>
              Confirm password
              <input
                autoComplete="new-password"
                disabled={pending}
                minLength={8}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Repeat your password"
                required
                type="password"
                value={form.confirmPassword}
              />
            </label>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={pending} type="submit">
            {pending ? "Please wait..." : copy.submitLabel}
          </button>
        </form>

        <p className="auth-switch">
          {copy.alternateLabel} <Link to={copy.alternateLink}>{copy.alternateAction}</Link>
        </p>
      </section>

      <aside className="auth-aside panel">
        <p className="eyebrow">Why this app works</p>
        <h2>Every account gets its own saved progression.</h2>
        <ul className="auth-feature-list">
          <li>Separate login and registration flow for real users.</li>
          <li>JSON-backed data store with unique profile state per account.</li>
          <li>Server-side quest progression, streaks, and daily resets.</li>
          <li>React dashboard and Express API ready to evolve toward full MERN.</li>
        </ul>
      </aside>
    </main>
  );
}
