import React, { useState } from 'react';
import Hero3D from './components/Hero3D';
import RoleSelector from './components/RoleSelector';
import OTPCard from './components/OTPCard';
import Footer from './components/Footer';

const App = () => {
  const [role, setRole] = useState(null);
  const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Hero3D />

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
