import Spline from '@splinetool/react-spline';

export default function Hero3D() {
  return (
    <div className="absolute inset-0">
      <Spline scene="https://prod.spline.design/2Cz7Gz2Gm7L6Il9d/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/80 to-transparent" />
    </div>
  );
}
