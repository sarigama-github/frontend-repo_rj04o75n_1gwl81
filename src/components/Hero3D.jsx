import React from 'react';
import Spline from '@splinetool/react-spline';

const Hero3D = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="w-full h-full">
        <Spline
          scene="https://prod.spline.design/6zPgI1Vd0y8I5j7N/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {/* Soft gradient overlays for readability; they won't block pointer events */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.0),rgba(0,0,0,0.5))]" />
    </div>
  );
};

export default Hero3D;
