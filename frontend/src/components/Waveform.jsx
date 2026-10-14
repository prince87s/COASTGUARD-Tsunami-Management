import { useEffect, useRef } from 'react';

export default function Waveform({ level }) {
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener('resize', resize);

    const amp = level === 'normal' ? 4 : level === 'watch' ? 11 : 22;
    const speed = level === 'normal' ? 0.02 : level === 'watch' ? 0.035 : 0.06;

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const color = getComputedStyle(document.documentElement).getPropertyValue('--state-color').trim();

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = mid
          + Math.sin(x * 0.02 + tRef.current) * amp * devicePixelRatio
          + Math.sin(x * 0.05 + tRef.current * 1.7) * (amp * 0.4) * devicePixelRatio
          + (Math.random() - 0.5) * 2 * devicePixelRatio;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6 * devicePixelRatio;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mid); ctx.lineTo(w, mid);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      tRef.current += speed;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [level]);

  return (
    <div className="waveform-wrap">
      <span className="waveform-label">Tide &amp; seismic sensor · Buoy 04-B</span>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}