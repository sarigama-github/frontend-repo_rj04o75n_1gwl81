import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Hash, Loader2, Mail, ShieldCheck, Smartphone, Sparkles, XCircle } from 'lucide-react';

function normalizeIdentifier(val) {
  return (val || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .trim();
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(val) {
  return emailRegex.test(val);
}

function normalizePhone(val) {
  if (!val) return '';
  const trimmed = val.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^0-9]/g, '');
  return hasPlus ? `+${digits}` : digits;
}

function validatePhoneRelaxed(val) {
  const digits = (val || '').replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function isLikelyEmail(val) {
  return /@/.test(val) && /\.[A-Za-z]{2,}$/.test(val);
}

export default function OTPCard({ apiBase, role }) {
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState('auto'); // 'email' | 'phone' | 'auto'
  const [phase, setPhase] = useState('collect'); // 'collect' | 'verify'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);

  const effectiveChannel = useMemo(() => {
    if (channel !== 'auto') return channel;
    const v = normalizeIdentifier(input);
    return isLikelyEmail(v) ? 'email' : 'phone';
  }, [channel, input]);

  useEffect(() => {
    // live clear errors when valid
    const v = normalizeIdentifier(input);
    if (effectiveChannel === 'email' && validateEmail(v)) setError('');
    if (effectiveChannel === 'phone') {
      const p = normalizePhone(v);
      if (validatePhoneRelaxed(p)) setError('');
    }
  }, [input, effectiveChannel]);

  const canSend = useMemo(() => {
    const v = normalizeIdentifier(input);
    if (effectiveChannel === 'email') return validateEmail(v);
    const p = normalizePhone(v);
    return validatePhoneRelaxed(p);
  }, [input, effectiveChannel]);

  const canVerify = useMemo(() => otp.join('').length === 6 && otp.every((d) => /\d/.test(d)), [otp]);

  const startOver = () => {
    setPhase('collect');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const handleSend = async () => {
    if (!apiBase) {
      setError('Please set the backend URL above.');
      return;
    }
    const idRaw = normalizeIdentifier(input);
    const id = effectiveChannel === 'email' ? idRaw : normalizePhone(idRaw);
    if (!canSend) {
      setError(effectiveChannel === 'email' ? 'Invalid email address' : 'Invalid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, channel: effectiveChannel, role }),
      });
      if (!res.ok) throw new Error('send_failed');
      setPhase('verify');
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (e) {
      setError('Could not send OTP. Check your API and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!apiBase) {
      setError('Please set the backend URL above.');
      return;
    }
    const idRaw = normalizeIdentifier(input);
    const id = effectiveChannel === 'email' ? idRaw : normalizePhone(idRaw);
    const code = otp.join('');
    if (!canVerify) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, code, role }),
      });
      if (!res.ok) throw new Error('verify_failed');
      const data = await res.json().catch(() => ({}));
      const token = data?.token || data?.access_token || 'ok';
      localStorage.setItem('hl_token', token);
      localStorage.setItem('hl_role', role);
      window.location.href = role === 'jobseeker' ? '/dashboard/jobseeker' : '/dashboard/recruiter';
    } catch (e) {
      setError('Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDigit = (i, v) => {
    if (!/^[0-9]?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const onKeyDownDigit = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
      {phase === 'collect' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              One-Time Passcode
            </div>
            <button
              onClick={() => setChannel(channel === 'auto' ? 'email' : channel === 'email' ? 'phone' : 'auto')}
              className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-sm"
              title="Toggle auto-detect/channel"
            >
              <Sparkles className="w-4 h-4" /> {channel === 'auto' ? 'Auto' : channel === 'email' ? 'Email' : 'Phone'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email or phone</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={effectiveChannel === 'email' ? 'you@example.com' : '+1 555 123 4567'}
                  className={`w-full rounded-md bg-white/10 border px-3 py-2 pr-10 outline-none placeholder:text-slate-400 focus:ring-2 ${
                    error ? 'border-rose-400/60 focus:ring-rose-400/40' : 'border-white/10 focus:ring-cyan-400/40'
                  }`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300">
                  {effectiveChannel === 'email' ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!canSend || loading}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                Send code
              </button>
            </div>
            {!!error && (
              <div className="inline-flex items-center gap-2 text-rose-300 text-sm">
                <XCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'verify' && (
        <div className="space-y-4">
          <div className="text-lg font-medium flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Enter the 6-digit code
          </div>
          <div className="flex items-center gap-2 justify-between">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={(e) => onChangeDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDownDigit(i, e)}
                className="w-12 h-12 text-center text-xl rounded-md bg-white/10 border border-white/10 focus:ring-2 focus:ring-cyan-400/40 outline-none"
              />
            ))}
          </div>
          {!!error && (
            <div className="inline-flex items-center gap-2 text-rose-300 text-sm">
              <XCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={!canVerify || loading}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Verify
            </button>
            <button
              onClick={startOver}
              className="text-sm text-slate-300 hover:text-white"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
