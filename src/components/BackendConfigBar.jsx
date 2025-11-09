import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link as LinkIcon, PlugZap, TriangleAlert, WifiOff } from 'lucide-react';

export default function BackendConfigBar({ apiBase, onChange, hostedPreviewBase }) {
  const [probe, setProbe] = useState({ status: 'idle', message: '' });

  const mismatchWarning = useMemo(() => {
    if (!apiBase) return '';
    const isLocalhost = /localhost|127\.0\.0\.1/i.test(apiBase);
    const isHosted = hostedPreviewBase && apiBase.startsWith(hostedPreviewBase);
    const currentIsHosted = /modal\.host|\.railway\.|vercel\.app|netlify\.app|render\.com/i.test(window.location.host);
    if (isLocalhost && currentIsHosted) return 'You are on a hosted preview but API points to localhost. This may not be reachable.';
    if (!isLocalhost && !isHosted && currentIsHosted && apiBase.startsWith('http://')) return 'Using HTTP for a remote API may be blocked by the browser. Prefer HTTPS.';
    return '';
  }, [apiBase, hostedPreviewBase]);

  const handlePing = async () => {
    if (!apiBase) return;
    setProbe({ status: 'loading', message: 'Pinging…' });
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/ping`);
      if (!res.ok) throw new Error('Non-200');
      const data = await res.json().catch(() => ({}));
      setProbe({ status: 'ok', message: data?.message || 'Online' });
    } catch (e) {
      setProbe({ status: 'error', message: 'Offline' });
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (apiBase) handlePing();
    }, 250);
    return () => clearTimeout(t);
  }, [apiBase]);

  return (
    <div className="sticky top-0 z-20 w-full backdrop-blur supports-[backdrop-filter]:bg-slate-950/40 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <LinkIcon className="w-4 h-4 text-slate-300" />
        <input
          value={apiBase}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://your-backend.example.com"
          className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400/60 placeholder:text-slate-400"
        />
        <button
          onClick={handlePing}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 px-3 py-2 text-sm font-medium transition"
        >
          <PlugZap className="w-4 h-4" />
          Ping
        </button>
        {probe.status === 'ok' && (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {probe.message || 'Online'}
          </span>
        )}
        {probe.status === 'error' && (
          <span className="inline-flex items-center gap-1 text-rose-400 text-sm">
            <WifiOff className="w-4 h-4" /> Offline
          </span>
        )}
      </div>
      {mismatchWarning && (
        <div className="border-t border-white/10 bg-amber-500/10 text-amber-300 text-xs">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            <TriangleAlert className="w-4 h-4" />
            <span>{mismatchWarning}</span>
          </div>
        </div>
      )}
    </div>
  );
}
