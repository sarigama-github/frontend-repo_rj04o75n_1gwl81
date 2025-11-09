import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-8 text-center text-slate-400 bg-slate-950 border-t border-white/10">
      <p className="text-sm">© {new Date().getFullYear()} HireLens — Secure identity for hiring.</p>
      <p className="text-xs mt-1">Built with a modern stack and real-time OTP verification.</p>
    </footer>
  );
};

export default Footer;
