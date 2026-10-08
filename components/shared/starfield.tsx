'use client';
import { useEffect, useRef } from 'react';

export function Starfield({ density = 100 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; z: number; size: number }[] = [];

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < density; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random(), size: Math.random() * 1.5 });
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(5, 6, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.z * 0.8})`;
        ctx.fill();
        star.y += star.z * 0.3;
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [density]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
