import React, { useEffect, useState } from 'react';
import { Globe, WifiOff, Wifi, Save } from 'lucide-react';

const isHosted = () => {
  try {
    return typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.');
  } catch {
    return false;
  }
};

const BackendConfigBar = ({ apiBase, onChange }) => {
  const [value, setValue] = useState(apiBase);
  const [status, setStatus] = useState('idle'); // idle | ok | fail | checking

  useEffect(() => {
    setValue(apiBase);
  }, [apiBase]);

  const ping = async () => {
    if (!value) return;
    setStatus('checking');
    try {
      const res = await fetch(`${value.replace(/\/$/, '')}/docs`, { method: 'GET' });
      if (res.ok) {
        setStatus('ok');
      } else {
        setStatus('fail');
      }
    } catch (e) {
      setStatus('fail');
    }
  };

  const save = () => {
    onChange(value);
    localStorage.setItem('hl_api_base', value);
    ping();
  };

  const showHostedLocalhostWarning = isHosted() && /localhost|127\.0\.0\.1/.test(apiBase || '');

  return (
    <div className="w-full bg-amber-950/40 border-b border-amber-500/30 text-amber-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Globe size={16} className="text-amber-300 shrink-0" />
          <div className="text-sm">
            <div className="truncate">Backend URL</div>
            {showHostedLocalhostWarning && (
              <div className="text-xs opacity-90">Hosted frontend cannot reach localhost. Use a public URL (Render/ngrok).</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            className="w-full md:w-[380px] rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="https://your-backend.example.com"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={save} className="inline-flex items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 text-sm">
            <Save size={14} /> Save
          </button>
          <button onClick={ping} className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-sm">
            {status === 'ok' ? <Wifi size={14} className="text-emerald-300" /> : status === 'fail' ? <WifiOff size={14} className="text-red-300" /> : <Wifi size={14} />}
            {status === 'checking' ? 'Checking…' : status === 'ok' ? 'Online' : status === 'fail' ? 'Offline' : 'Ping'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendConfigBar;
