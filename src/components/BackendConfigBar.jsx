import React, { useEffect, useMemo, useState } from 'react';
import { Link2, Wifi, WifiOff } from 'lucide-react';

const defaultApiBase = () => {
  // Priority: localStorage -> env -> derived from host
  const stored = typeof window !== 'undefined' ? localStorage.getItem('hl_api_base') : null;
  if (stored) return stored;
  const env = import.meta.env.VITE_BACKEND_URL;
  if (env) return env;
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      // If running on modal.host-like domain, derive sibling on port 8000
      const derived = `${url.protocol}//${url.hostname.replace('-3000', '-8000')}`;
      return derived;
    } catch (e) {
      // ignore
    }
  }
  return 'http://localhost:8000';
};

const BackendConfigBar = ({ apiBase, setApiBase }) => {
  const [status, setStatus] = useState('idle'); // idle | online | offline | checking
  const [input, setInput] = useState(apiBase || defaultApiBase());

  const mismatchWarning = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const host = window.location.hostname;
      const apiHost = new URL(input).hostname;
      const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
      const apiIsLocal = apiHost.includes('localhost') || apiHost.includes('127.0.0.1');
      if (isLocalHost && !apiIsLocal) return null;
      if (!isLocalHost && apiIsLocal) return 'You are on a hosted preview but API points to localhost. That will not work from here.';
      return null;
    } catch {
      return null;
    }
  }, [input]);

  useEffect(() => {
    setInput(apiBase || defaultApiBase());
  }, [apiBase]);

  const save = () => {
    try {
      const url = new URL(input);
      localStorage.setItem('hl_api_base', url.toString());
      setApiBase(url.toString());
    } catch {
      // ignore invalid URL
    }
  };

  const ping = async () => {
    if (!apiBase) return;
    setStatus('checking');
    try {
      const res = await fetch(`${apiBase}/ping`, { cache: 'no-store' });
      if (res.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (e) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  return (
    <div className="w-full flex items-center gap-3 p-3 bg-white/70 backdrop-blur rounded-xl shadow border border-black/5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link2 className="w-4 h-4" />
        <span className="font-medium">Backend</span>
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://your-backend.example.com"
        className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"
      />
      <button
        onClick={save}
        className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-black/80"
      >Save</button>
      <button
        onClick={ping}
        className="px-3 py-2 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-2"
      >{status === 'online' ? (<><Wifi className="w-4 h-4" />Online</>) : status === 'checking' ? 'Checking…' : (<><WifiOff className="w-4 h-4" />Offline</>)}
      </button>
      {mismatchWarning && (
        <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
          {mismatchWarning}
        </div>
      )}
    </div>
  );
};

export default BackendConfigBar;
