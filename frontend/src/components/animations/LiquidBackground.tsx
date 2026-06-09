"use client";

import React, { useEffect, useRef } from "react";

export default function LiquidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const TO_RAD = Math.PI / 180;
    const HALF_PI = Math.PI / 2;
    const TAU = Math.PI * 2;
    const cos = Math.cos;
    const sin = Math.sin;
    const round = Math.round;
    const rand = (max: number) => Math.random() * max;

    const fadeInOut = (life: number, ttl: number) => {
      const halfTTL = ttl / 2;
      return life < halfTTL ? life / halfTTL : 1 - (life - halfTTL) / halfTTL;
    };

    const pipeCount = 30;
    const pipePropCount = 8;
    const pipePropsLength = pipeCount * pipePropCount;
    const turnCount = 8;
    const turnAmount = (360 / turnCount) * TO_RAD;
    const turnChanceRange = 58;
    const baseSpeed = 0.5;
    const rangeSpeed = 1;
    const baseTTL = 100;
    const rangeTTL = 300;
    const baseWidth = 2;
    const rangeWidth = 4;
    const baseHue = 180;
    const rangeHue = 60;
    const backgroundColor = "hsla(150,80%,1%,1)";

    let canvas: {
      a: HTMLCanvasElement;
      b: HTMLCanvasElement;
    };
    let ctx: {
      a: CanvasRenderingContext2D | null;
      b: CanvasRenderingContext2D | null;
    };
    const center: [number, number] = [0, 0];
    let tick = 0;
    let pipeProps: Float32Array;
    let animationId: number;

    const initPipe = (i: number) => {
      const x = rand(canvas.a.width);
      const y = center[1];
      const direction = round(rand(1)) ? HALF_PI : TAU - HALF_PI;
      const speed = baseSpeed + rand(rangeSpeed);
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const width = baseWidth + rand(rangeWidth);
      const hue = baseHue + rand(rangeHue);

      pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);
    };

    const initPipes = () => {
      pipeProps = new Float32Array(pipePropsLength);
      for (let i = 0; i < pipePropsLength; i += pipePropCount) {
        initPipe(i);
      }
    };

    const drawPipe = (x: number, y: number, life: number, ttl: number, width: number, hue: number) => {
      if (!ctx.a) return;
      ctx.a.save();
      ctx.a.strokeStyle = `hsla(${hue},75%,50%,${fadeInOut(life, ttl) * 0.045})`;
      ctx.a.beginPath();
      ctx.a.arc(x, y, width, 0, TAU);
      ctx.a.stroke();
      ctx.a.closePath();
      ctx.a.restore();
    };

    const updatePipe = (i: number) => {
      const i2 = 1 + i;
      const i3 = 2 + i;
      const i4 = 3 + i;
      const i5 = 4 + i;
      const i6 = 5 + i;
      const i7 = 6 + i;
      const i8 = 7 + i;

      let x = pipeProps[i];
      let y = pipeProps[i2];
      let direction = pipeProps[i3];
      const speed = pipeProps[i4];
      let life = pipeProps[i5];
      const ttl = pipeProps[i6];
      const width = pipeProps[i7];
      const hue = pipeProps[i8];

      drawPipe(x, y, life, ttl, width, hue);

      life++;
      x += cos(direction) * speed;
      y += sin(direction) * speed;
      const turnChance = !(tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
      const turnBias = round(rand(1)) ? -1 : 1;
      direction += turnChance ? turnAmount * turnBias : 0;

      // Wrapping bounds
      if (x > canvas.a.width) x = 0;
      if (x < 0) x = canvas.a.width;
      if (y > canvas.a.height) y = 0;
      if (y < 0) y = canvas.a.height;

      pipeProps[i] = x;
      pipeProps[i2] = y;
      pipeProps[i3] = direction;
      pipeProps[i5] = life;

      if (life > ttl) {
        initPipe(i);
      }
    };

    const createCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      canvas = {
        a: document.createElement("canvas"),
        b: document.createElement("canvas")
      };

      canvas.b.style.position = "absolute";
      canvas.b.style.top = "0";
      canvas.b.style.left = "0";
      canvas.b.style.width = "100%";
      canvas.b.style.height = "100%";

      container.appendChild(canvas.b);

      ctx = {
        a: canvas.a.getContext("2d"),
        b: canvas.b.getContext("2d")
      };

      tick = 0;
    };

    const resize = () => {
      if (!canvas || !ctx.a || !ctx.b) return;
      const { innerWidth, innerHeight } = window;

      canvas.a.width = innerWidth;
      canvas.a.height = innerHeight;

      ctx.a.drawImage(canvas.b, 0, 0);

      canvas.b.width = innerWidth;
      canvas.b.height = innerHeight;

      ctx.b.drawImage(canvas.a, 0, 0);

      center[0] = 0.5 * canvas.a.width;
      center[1] = 0.5 * canvas.a.height;
    };

    const render = () => {
      if (!ctx.b || !canvas.b || !canvas.a) return;
      ctx.b.save();
      ctx.b.fillStyle = backgroundColor;
      ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
      ctx.b.restore();

      ctx.b.save();
      ctx.b.filter = "blur(12px)";
      ctx.b.globalAlpha = 0.5; // Soften the background neon blur
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();

      ctx.b.save();
      ctx.b.drawImage(canvas.a, 0, 0);
      ctx.b.restore();
    };

    const draw = () => {
      tick++;
      for (let i = 0; i < pipePropsLength; i += pipePropCount) {
        updatePipe(i);
      }
      render();
      animationId = window.requestAnimationFrame(draw);
    };

    createCanvas();
    resize();
    initPipes();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
      if (containerRef.current && canvas?.b) {
        containerRef.current.removeChild(canvas.b);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ backgroundColor: "#030303" }}
    />
  );
}
