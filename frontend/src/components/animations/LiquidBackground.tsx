"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  decay: number;
}

interface FluidBlob {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  speed: number;
}

export default function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle pool
    const particles: Particle[] = [];
    const maxParticles = prefersReducedMotion ? 0 : 80;

    // Ambient floating particles
    const ambientParticles: { x: number; y: number; radius: number; vy: number; alpha: number }[] = [];
    const maxAmbient = prefersReducedMotion ? 10 : 40;
    for (let i = 0; i < maxAmbient; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vy: -(Math.random() * 0.3 + 0.1),
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    // Fluid background blobs
    const blobs: FluidBlob[] = [
      {
        x: width * 0.2,
        y: height * 0.3,
        targetX: width * 0.2,
        targetY: height * 0.3,
        radius: Math.min(width, height) * 0.35,
        color: "rgba(0, 82, 255, 0.12)", // ThunderBlue
        vx: 0,
        vy: 0,
        speed: 0.005,
      },
      {
        x: width * 0.8,
        y: height * 0.7,
        targetX: width * 0.8,
        targetY: height * 0.7,
        radius: Math.min(width, height) * 0.4,
        color: "rgba(0, 240, 255, 0.06)", // ThunderCyan
        vx: 0,
        vy: 0,
        speed: 0.004,
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5,
        targetY: height * 0.5,
        radius: Math.min(width, height) * 0.3,
        color: "rgba(0, 40, 150, 0.08)", // Deeper Blue
        vx: 0,
        vy: 0,
        speed: 0.006,
      },
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      blobs[0].radius = Math.min(width, height) * 0.35;
      blobs[1].radius = Math.min(width, height) * 0.4;
      blobs[2].radius = Math.min(width, height) * 0.3;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      if (prefersReducedMotion) return;

      const lastX = mouseRef.current.lastX;
      const lastY = mouseRef.current.lastY;
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);

      // Create mouse particles on movement
      if (dist > 6) {
        const pCount = Math.min(3, Math.floor(dist / 6));
        for (let i = 0; i < pCount; i++) {
          if (particles.length < maxParticles) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.8 + 0.2;
            particles.push({
              x: e.clientX,
              y: e.clientY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 0.2,
              radius: Math.random() * 2 + 1,
              alpha: 0.8,
              color: Math.random() > 0.4 ? "0, 82, 255" : "0, 240, 255", // Blue or Cyan
              decay: Math.random() * 0.015 + 0.01,
            });
          }
        }
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Main animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);

      // Draw fluid blobs
      blobs.forEach((blob, idx) => {
        if (!prefersReducedMotion) {
          // Slow orbit motion
          const angle = time * blob.speed * 0.05 + idx * Math.PI;
          const range = Math.min(width, height) * 0.12;
          blob.targetX = width / 2 + Math.cos(angle) * range * (idx === 1 ? 2.2 : 1.2) + (idx === 0 ? -width * 0.15 : width * 0.15);
          blob.targetY = height / 2 + Math.sin(angle * 1.5) * range + (idx === 2 ? -height * 0.1 : height * 0.1);

          // Easing
          blob.x += (blob.targetX - blob.x) * 0.02;
          blob.y += (blob.targetY - blob.y) * 0.02;
        }

        // Draw radial gradient for liquid look
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "rgba(3, 3, 3, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ambient particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ambientParticles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.y += p.vy;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Draw interactive mouse particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        // Add subtle shadow glow
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
