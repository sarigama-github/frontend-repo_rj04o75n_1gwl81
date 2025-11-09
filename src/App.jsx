import React, { useEffect, useState } from 'react';
import Hero3D from './components/Hero3D';
import RoleSelector from './components/RoleSelector';
import OTPCard from './components/OTPCard';
import Footer from './components/Footer';
import BackendConfigBar from './components/BackendConfigBar';

const App = () => {
  // Prefer env, else fall back to the live backend URL so the hosted preview works out-of-the-box
  const hostedBackend = 'https://ta-01k9kp226w6e89hg37qg0e3jrg-8000.wo-nue4yps4jzha44ndc7abb5t2y.w.modal.host';
  const defaultApi = import.meta.env.VITE_BACKEND_URL || hostedBackend;
  const [apiBase, setApiBase] = useState(defaultApi);
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hl_api_base');
      if (saved) setApiBase(saved);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Hero3D />

      <BackendConfigBar apiBase={apiBase} onChange={setApiBase} />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {!role ? (
            <div className="grid md:grid-cols-5 gap-8 items-start">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-white">Who are you?</h2>
                <p className="text-slate-300 mt-2">Choose your role to continue with sign-in.</p>
                <div className="mt-5">
                  <RoleSelector onSelect={setRole} />
                </div>
              </div>
              <div className="md:col-span-3">
                <OTPCard role={role || 'jobseeker'} apiBase={apiBase} />
              </div>
            </div>
          ) : (
            <div>
              <OTPCard role={role} apiBase={apiBase} />
              <button
                onClick={() => setRole(null)}
                className="mt-6 text-sm text-slate-300 underline hover:text-white"
              >
                Change role
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
