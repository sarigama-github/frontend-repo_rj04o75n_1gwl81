import React from 'react';
import Spline from '@splinetool/react-spline';
import { ShieldCheck } from 'lucide-react';

const Hero3D = () => {
  return (
    <section className="relative w-full min-h-[480px] md:min-h-[560px] flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Soft gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/60 to-slate-950" />

      <div className="relative z-10 px-6 max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 text-sky-300 px-4 py-1 mb-4 ring-1 ring-sky-500/30">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium tracking-wide">Secure Identity • Real-time OTP</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
          HireLens Authentication
        </h1>
        <p className="mt-3 md:mt-4 text-slate-300 max-w-2xl mx-auto">
          A modern, secure sign-in experience for Job Seekers and Companies. Verify instantly via email or SMS with a delightful 3D interface.
        </p>
      </div>
    </section>
  );
};

export default Hero3D;
