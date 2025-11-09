import React, { useEffect, useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';

const Input = ({ label, icon: Icon, helper, ...props }) => (
  <label className="block">
    <span className="text-sm text-slate-300">{label}</span>
    <div className="mt-1 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-sky-400">
      {Icon && <Icon size={16} className="text-slate-300" />}
      <input
        className="w-full bg-transparent outline-none text-white placeholder:text-slate-400"
        {...props}
      />
    </div>
    {helper}
  </label>
);

const normalizeIdentifier = (val) => (val || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

const validateEmail = (email) => {
  const value = normalizeIdentifier(email).toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // universal, accepts mixed-case and modern TLDs
  return regex.test(value);
};

// Relaxed phone normalization + validation
const normalizePhone = (phone) => {
  const raw = normalizeIdentifier(phone);
  // Keep leading + if present, strip all non-digits otherwise
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/[^0-9]/g, '');
  return hasPlus ? `+${digits}` : digits;
};

const validatePhoneRelaxed = (phone) => {
  const norm = normalizePhone(phone);
  // Accept 7-15 digits per ITU E.164 guidance (flexible)
  const digits = norm.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const isLikelyEmail = (value) => {
  const v = normalizeIdentifier(value);
  // Quick heuristic: contains @ and a dot after it
  if (!v.includes('@')) return false;
  const at = v.indexOf('@');
  const dot = v.indexOf('.', at + 1);
  return dot > at + 1;
};

const OTPCard = ({ role, apiBase }) => {
  const [via, setVia] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState('collect');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);

  const normalizeBase = (url) => (url || '').replace(/\/$/, '');

  // Auto-detect channel based on input
  useEffect(() => {
    if (!autoDetect) return;
    const val = normalizeIdentifier(identifier);
    if (!val) return;
    if (isLikelyEmail(val)) {
      if (via !== 'email') setVia('email');
    } else {
      if (via !== 'phone') setVia('phone');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, autoDetect]);

  // Live-clear error message when user fixes input
  useEffect(() => {
    if (message?.type === 'error') {
      if (via === 'email') {
        if (validateEmail(identifier)) {
          setMessage(null);
        }
      } else if (validatePhoneRelaxed(identifier)) {
        setMessage(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, via]);

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const idRaw = normalizeIdentifier(identifier);
      if (!idRaw) {
        setMessage({ type: 'error', text: 'Please enter your email or phone number' });
        setLoading(false);
        return;
      }

      let idToSend = idRaw;
      if (via === 'email') {
        if (!validateEmail(idRaw)) {
          setMessage({ type: 'error', text: 'Please enter a valid email address' });
          setLoading(false);
          return;
        }
        idToSend = idRaw.toLowerCase();
      } else {
        if (!validatePhoneRelaxed(idRaw)) {
          setMessage({ type: 'error', text: 'Please enter a valid phone number' });
          setLoading(false);
          return;
        }
        idToSend = normalizePhone(idRaw);
      }

      const base = normalizeBase(apiBase);
      const res = await fetch(`${base}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idToSend, via }),
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}
      if (!res.ok) throw new Error(data?.detail || 'Network');
      if (data.status === 'sent') {
        setPhase('verify');
        const debugInfo = data.debug_code ? ` (demo code: ${data.debug_code})` : '';
        setMessage({ type: 'success', text: 'OTP sent! Please check your ' + (via === 'email' ? 'email.' : 'phone.') + debugInfo });
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to send OTP' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: (e?.message?.includes('Invalid') ? e.message : 'Network error. Is the backend running?') });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const base = normalizeBase(apiBase);
      const res = await fetch(`${base}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: normalizeIdentifier(via === 'phone' ? normalizePhone(identifier) : identifier.toLowerCase()), otp }),
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}
      if (!res.ok) throw new Error(data?.detail || 'Network');
      if (data.status === 'verified') {
        try {
          localStorage.setItem('hl_token', data.token);
          localStorage.setItem('hl_role', role);
        } catch {}
        window.location.href = role === 'jobseeker' ? '/dashboard/jobseeker' : '/dashboard/recruiter';
      } else {
        setMessage({ type: 'error', text: data.detail || 'Invalid OTP' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'Network error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-white/5 border border-white/10 shadow-xl p-6 md:p-8 backdrop-blur">
      <h2 className="text-xl md:text-2xl font-semibold text-white">Sign In — Welcome to HireLens</h2>
      <p className="text-slate-300 text-sm mt-1">Signing in as <span className="text-sky-300 font-medium">{role === 'jobseeker' ? 'Job Seeker' : 'Company'}</span></p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-slate-200">
            <input
              type="radio"
              name="via"
              value="email"
              checked={via === 'email'}
              onChange={(e) => { setVia(e.target.value); setAutoDetect(false); }}
            />
            <span className="flex items-center gap-1"><Mail size={16} /> Email</span>
          </label>
          <label className="flex items-center gap-2 text-slate-200">
            <input
              type="radio"
              name="via"
              value="phone"
              checked={via === 'phone'}
              onChange={(e) => { setVia(e.target.value); setAutoDetect(false); }}
            />
            <span className="flex items-center gap-1"><Phone size={16} /> Phone</span>
          </label>
        </div>
        <button
          type="button"
          onClick={() => setAutoDetect((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${autoDetect ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
        >
          <Wand2 size={14} /> {autoDetect ? 'Auto-detect: On' : 'Auto-detect: Off'}
        </button>
      </div>

      <div className="mt-4">
        <Input
          label={via === 'email' ? 'Email address' : 'Phone number'}
          icon={via === 'email' ? Mail : Phone}
          type={via === 'email' ? 'text' : 'tel'}
          placeholder={via === 'email' ? 'name@example.com' : '+1 (555) 123‑4567'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          helper={message?.type === 'error' ? (
            <p className="text-red-400 mt-1 text-sm">⚠️ {message.text}</p>
          ) : null}
        />
        {via === 'phone' && (
          <p className="text-xs text-slate-400 mt-1">We accept most formats. You can include country code or symbols; we’ll handle it.</p>
        )}
      </div>

      {message && message.type !== 'error' && (
        <div className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-200 ring-1 ring-red-500/30' : 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/30'}`}>
          {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {phase === 'collect' && (
        <button
          onClick={sendOtp}
          disabled={loading || !normalizeIdentifier(identifier)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} /> {loading ? 'Sending…' : 'Send OTP'}
        </button>
      )}

      {phase === 'verify' && (
        <div className="mt-4">
          <Input
            label="Enter OTP"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={verifyOtp}
            disabled={loading || otp.trim().length < 4}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} /> {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Social sign-in</p>
        <div className="flex items-center gap-3">
          <button className="flex-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-2">Continue with LinkedIn</button>
          <button className="flex-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-2">Continue with GitHub</button>
        </div>
      </div>
    </div>
  );
};

export default OTPCard;
