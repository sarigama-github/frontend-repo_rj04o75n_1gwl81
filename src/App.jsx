import React, { useEffect, useMemo, useState } from 'react';
import Hero3D from './components/Hero3D';
import BackendConfigBar from './components/BackendConfigBar';
import RoleSelector from './components/RoleSelector';
import OTPCard from './components/OTPCard';
import Footer from './components/Footer';

function deriveDefaultApiBase() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('hl_api_base') : null;
  if (stored) return stored;
  const env = import.meta.env.VITE_BACKEND_URL;
  if (env) return env;
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      return `${url.protocol}//${url.hostname.replace('-3000', '-8000')}`;
    } catch {}
  }
  return 'http://localhost:8000';
}

const App = () => {
  const [apiBase, setApiBase] = useState('');
  const [role, setRole] = useState('jobseeker');

  useEffect(() => {
    setApiBase(deriveDefaultApiBase());
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <Hero3D />

      <div className="relative z-10">
        <header className="max-w-6xl mx-auto px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/90 grid place-items-center font-bold">HL</div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">HireLens</h1>
                <p className="text-xs text-slate-300">See talent clearly.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <BackendConfigBar apiBase={apiBase} setApiBase={setApiBase} />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-10 items-start">
          <section className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-semibold leading-tight">
              Sign in with a one-time code
            </h2>
            <p className="text-slate-300 max-w-prose">
              Secure, passwordless access for candidates and companies. Choose your role, enter your email or phone, and we’ll send a code instantly.
            </p>
            <RoleSelector role={role} onSelect={setRole} />
          </section>

          <section>
            <OTPCard apiBase={apiBase} role={role} />
          </section>
        </main>

        <div className="max-w-6xl mx-auto px-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default App;
