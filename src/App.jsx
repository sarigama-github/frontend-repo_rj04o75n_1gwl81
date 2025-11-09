import { useEffect, useMemo, useState } from 'react';
import Hero3D from './components/Hero3D';
import BackendConfigBar from './components/BackendConfigBar';
import RoleSelector from './components/RoleSelector';
import OTPCard from './components/OTPCard';
import Footer from './components/Footer';

export default function App() {
  const hostedPreviewBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host.replace(/-3000\./, '-8000.')}` : '';
  const initialApiBase = useMemo(() => {
    const fromEnv = import.meta.env.VITE_BACKEND_URL;
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hl_api_base') : '';
    return stored || fromEnv || hostedPreviewBase || '';
  }, [hostedPreviewBase]);

  const [apiBase, setApiBase] = useState(initialApiBase);
  const [role, setRole] = useState('jobseeker');

  useEffect(() => {
    if (apiBase) {
      try {
        window.localStorage.setItem('hl_api_base', apiBase);
      } catch {}
    }
  }, [apiBase]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <Hero3D />

      <div className="relative z-10 flex min-h-screen flex-col">
        <BackendConfigBar apiBase={apiBase} onChange={setApiBase} hostedPreviewBase={hostedPreviewBase} />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-4xl text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              HireLens — Sign in with One-Time Passcode
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Choose your role, enter your email or phone, and we’ll send you a secure OTP. No passwords, no friction.
            </p>
          </div>

          <RoleSelector value={role} onSelect={setRole} />

          <OTPCard apiBase={apiBase} role={role} />
        </main>

        <Footer />
      </div>
    </div>
  );
}
