import React, { useEffect, useMemo, useState } from 'react';

const zeroWidthRegex = /[\u200B-\u200D\uFEFF]/g;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIdentifier(raw) {
  if (!raw) return '';
  const t = raw.replace(zeroWidthRegex, '').trim();
  return t;
}

function normalizePhone(raw) {
  if (!raw) return '';
  const firstPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/[^0-9]/g, '');
  return firstPlus ? `+${digits}` : digits;
}

function isPhoneLikely(v) {
  const s = v.trim();
  return s.startsWith('+') || /\d/.test(s);
}

function validatePhoneRelaxed(v) {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function validateEmail(v) {
  return emailRegex.test(v);
}

const OTPCard = ({ apiBase, role }) => {
  const [phase, setPhase] = useState('collect'); // collect | verify
  const [channel, setChannel] = useState('auto'); // auto | email | phone
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | verifying

  const effectiveChannel = useMemo(() => {
    if (channel !== 'auto') return channel;
    const n = normalizeIdentifier(identifier);
    return isPhoneLikely(n) ? 'phone' : 'email';
  }, [channel, identifier]);

  useEffect(() => {
    // clear error when input becomes valid
    const n = normalizeIdentifier(identifier);
    if (effectiveChannel === 'email' && validateEmail(n)) setError('');
    if (effectiveChannel === 'phone' && validatePhoneRelaxed(normalizePhone(n))) setError('');
  }, [identifier, effectiveChannel]);

  const send = async () => {
    const n = normalizeIdentifier(identifier);
    let body = { role };
    if (effectiveChannel === 'email') {
      if (!validateEmail(n)) {
        setError('Please enter a valid email like name@example.com');
        return;
      }
      body.email = n;
    } else {
      const p = normalizePhone(n);
      if (!validatePhoneRelaxed(p)) {
        setError('Enter a valid phone number (7–15 digits). Include country code for best results.');
        return;
      }
      body.phone = p;
    }

    if (!apiBase) {
      setError('Set your backend URL above before sending the code.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`${apiBase}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to send code');
      setPhase('verify');
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to send code');
    } finally {
      setStatus('idle');
    }
  };

  const verify = async () => {
    if (!otp || otp.trim().length < 4) {
      setError('Enter the 4–8 digit code you received');
      return;
    }
    if (!apiBase) {
      setError('Set your backend URL above before verifying.');
      return;
    }
    setStatus('verifying');
    try {
      const res = await fetch(`${apiBase}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: normalizeIdentifier(identifier), otp: otp.trim(), role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Verification failed');
      if (data?.token) {
        localStorage.setItem('hl_token', data.token);
      }
      localStorage.setItem('hl_role', role);
      // Redirect by role
      window.location.href = role === 'company' ? '/dashboard/company' : '/dashboard/jobs';
    } catch (e) {
      setError(e.message || 'Verification failed');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white/80 backdrop-blur border border-black/5 shadow-xl">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Sign in to HireLens</h2>
        <p className="text-sm text-gray-600">Use your email or phone. We’ll send you a one-time code.</p>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs">
        <span className={`px-2 py-1 rounded-full border ${effectiveChannel === 'email' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>Email</span>
        <span className={`px-2 py-1 rounded-full border ${effectiveChannel === 'phone' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>Phone</span>
        <div className="ml-auto text-gray-500">Role: <span className="font-medium capitalize">{role}</span></div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="name@example.com or +15551234567"
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            <span>Detected: <span className="font-medium">{effectiveChannel}</span></span>
            <span className="opacity-50">•</span>
            <button className={`underline ${effectiveChannel==='email'?'text-indigo-600':'text-gray-600'}`} onClick={() => setChannel('email')}>Email</button>
            <button className={`underline ${effectiveChannel==='phone'?'text-indigo-600':'text-gray-600'}`} onClick={() => setChannel('phone')}>Phone</button>
            <button className={`underline ${channel==='auto'?'text-indigo-600':'text-gray-600'}`} onClick={() => setChannel('auto')}>Auto</button>
          </div>
        </div>

        {phase === 'verify' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              placeholder="123456"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-md">{error}</div>
        )}

        <div className="flex gap-2">
          {phase === 'collect' ? (
            <button
              onClick={send}
              disabled={status !== 'idle'}
              className="flex-1 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60"
            >{status === 'sending' ? 'Sending…' : 'Send Code'}</button>
          ) : (
            <button
              onClick={verify}
              disabled={status !== 'idle'}
              className="flex-1 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
            >{status === 'verifying' ? 'Verifying…' : 'Verify & Continue'}</button>
          )}

          {phase === 'verify' && (
            <button
              onClick={() => { setPhase('collect'); setOtp(''); setError(''); }}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >Back</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPCard;
