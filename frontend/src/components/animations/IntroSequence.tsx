"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const pathTRef = useRef<SVGPathElement>(null);
  const pathCRef = useRef<SVGPathElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check session storage to see if we already played the intro
    const introPlayed = sessionStorage.getItem("tcconf2026_intro_played");
    if (introPlayed === "true") {
      setShouldPlay(false);
      onComplete();
    } else {
      setShouldPlay(true);
      // Disable body scroll while intro is playing
      document.body.style.overflow = "hidden";
    }
  }, [onComplete]);

  useEffect(() => {
    if (shouldPlay !== true) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Fade out the main container
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
              sessionStorage.setItem("tcconf2026_intro_played", "true");
              document.body.style.overflow = "unset";
              onComplete();
            }
          });
        }
      });

      // 1. Initial State
      gsap.set([pathTRef.current, pathCRef.current], {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0.1,
      });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(taglineRef.current, { opacity: 0, y: 15 });
      gsap.set(beamRef.current, { x: "-100%" });

      // 2. Slow emerge & Left-to-Right clip-path reveal
      tl.to([pathTRef.current, pathCRef.current], {
        opacity: 1,
        clipPath: "inset(0 0% 0 0)",
        duration: 2.2,
        ease: "power2.inOut",
        stagger: 0.3,
      }, "+=0.3");

      // 3. Ambient cinematic glow fades in & pulses behind the logo
      tl.to(glowRef.current, {
        opacity: 1,
        scale: 1.2,
        duration: 1.8,
        ease: "power2.out",
      }, "-=1.2");

      // 4. Soft light beam sweeps across logo
      tl.to(beamRef.current, {
        x: "200%",
        duration: 1.8,
        ease: "power3.inOut",
      }, "-=0.8");

      // 5. Tagline fades and slides in elegantly
      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      }, "-=0.6");

      // 6. Hold for a moment
      tl.to({}, { duration: 1.2 });
    });

    return () => ctx.revert();
  }, [shouldPlay, onComplete]);

  if (shouldPlay === false || shouldPlay === null) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#030303] select-none"
    >
      {/* Background radial soft ambient blue light */}
      <div
        ref={glowRef}
        className="absolute w-[400px] h-[400px] rounded-full bg-thunder-blue opacity-0 blur-[120px] pointer-events-none -z-10"
      />

      <div className="relative flex flex-col items-center max-w-lg px-8">
        {/* Logo and Light Sweep Container */}
        <div ref={logoContainerRef} className="relative flex items-center justify-center space-x-6 overflow-hidden p-8">
          {/* Sweeping light beam overlay */}
          <div
            ref={beamRef}
            className="absolute top-0 bottom-0 left-0 w-1/2 -skew-x-20 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10"
            style={{ mixBlendMode: "overlay" }}
          />

          {/* Logo T */}
          <svg
            className="w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            viewBox="0 0 561 657"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={pathTRef}
              d="M137.254 654.726L134.98 652.169V649.611V646.769L136.401 645.064L138.106 643.075L162.26 628.298L179.026 616.079L188.688 606.986L196.077 596.187L206.307 576.58L210.569 566.065L213.411 555.551L216.537 539.638L219.094 523.156L222.22 503.832L223.073 483.372L224.209 428.243L223.925 372.83L223.357 289.853V248.932L223.073 207.159L222.504 152.599V125.603L222.22 111.963L221.936 98.3226L215.116 97.7542L205.454 96.9017L196.077 96.6176H182.721H170.217H150.325L136.401 97.1859L124.182 98.0384L108.268 99.1751L101.164 100.312L90.6499 101.733L78.4306 104.574L70.1897 107.416L61.3805 111.11L52.8554 115.373L44.6145 119.635L29.8377 130.15L22.7335 136.401L15.061 142.937L11.3668 145.211L6.25172 148.336L0 151.462L1.98918 140.664L3.6942 130.15L7.10422 116.509L13.3559 100.312L21.3127 86.1033L32.1111 73.3157L51.7188 57.6864L70.1897 48.3088L95.1966 40.6362L119.351 38.0787L136.117 37.2262H171.922H198.35H239.839L269.392 37.7945H287.863H307.187H324.805L342.708 38.3629L369.42 39.4995L394.142 40.0679L420.57 40.6362L437.904 40.9204L459.217 40.6362L480.53 38.3629L500.422 34.3845L517.472 29.2694L532.248 21.3127L547.594 10.5143L560.097 0L559.529 5.39922L556.403 18.471L551.004 32.9636L540.205 55.1288L520.882 70.474L473.141 96.3334L438.189 104.858L395.847 108.269L328.215 107.416V315.428L328.783 369.988V450.124L330.204 529.692V571.18L328.783 590.22L327.647 606.417L325.089 613.237L319.974 619.489L314.007 624.32L304.345 630.856L295.252 636.255L284.737 641.086L274.507 644.496L263.709 647.906L252.91 650.464L236.713 653.021L220.515 654.726L208.864 656.147L196.929 656.999H169.081H153.735L139.527 656.431L137.254 654.726Z"
              fill="#26D3DF"
            />
          </svg>

          {/* Logo C */}
          <svg
            className="w-20 h-20 md:w-28 md:h-28 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            viewBox="0 0 473 545"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={pathCRef}
              d="M446.806 147.892L451.431 147.12L450.146 130.917L448.861 109.569L446.806 84.6199L442.438 67.1301L436.272 50.6691L430.362 38.8377L422.911 27.778L413.918 17.747L403.384 9.25932L388.225 2.82924L380.517 0.514407L370.24 0H357.65H346.088H314.999H286.223L267.981 2.05763L252.565 4.62966L229.955 9.77373L214.539 14.9178L192.699 22.6339L175.999 31.3788L154.16 42.4386L137.459 52.9839L120.501 64.3008L104.829 76.1322L89.6695 88.7352L77.0798 101.338L64.747 115.227L53.1851 128.602L46.5048 138.633L41.3661 146.863L36.2275 156.122L31.8596 164.867L23.3809 182.872L17.4714 200.619L13.3605 212.193L10.0204 223.767L6.42332 235.855L4.36785 248.458L2.31239 257.975L1.02773 267.234L0.513865 285.239L0 312.502L3.08319 339.766L9.76344 372.43L16.1868 389.92L22.3531 405.867L36.7414 432.102L45.4771 446.248L54.9836 458.851L66.0317 471.711L78.3644 483.799L92.4957 495.374L106.884 506.433L120.758 514.407L136.174 521.866L151.847 528.553L161.097 531.639L171.888 535.497L179.853 537.555L187.561 539.098L196.553 540.641L208.115 542.185L218.65 543.214L229.441 543.728L241.003 544.242L252.565 544.5L273.119 542.699L284.167 540.899L295.216 538.584L304.465 535.497L312.944 532.668L321.423 529.325L330.929 525.466L362.789 505.919L386.684 487.658L405.954 469.911L414.175 460.394L423.168 449.849L437.556 430.044L450.66 408.953L469.93 373.202L472.499 367.544V363.686L470.957 360.342L469.416 358.284L467.103 355.969L463.763 355.198L460.166 356.741L449.632 371.659L438.841 386.319L427.793 400.723L416.488 414.097L401.329 428.501L385.399 440.332L367.671 452.421L349.685 462.194L333.242 469.139L316.027 474.283L300.097 478.398L291.875 479.17H283.654H273.376L263.613 478.655L253.079 477.112L244.6 475.055L236.378 473.769L227.899 470.939L219.164 468.367L211.712 465.024L202.206 460.908L193.984 456.536L184.991 450.878L177.284 444.705L168.034 438.275L160.069 430.558L152.618 421.814L145.681 412.04L139.771 404.324L134.376 395.579L128.98 386.319L124.869 376.031L119.988 365.486L116.39 354.941L112.793 344.395L109.967 331.792L107.655 311.216L106.627 288.582L107.141 269.549L108.682 250.259L109.196 240.228L110.995 229.683L113.05 219.909L116.134 209.621L118.125 201.375L120.758 191.617L123.328 182.614L126.925 174.384L131.293 163.581L135.403 155.865L138.744 149.692L142.598 142.748L148.507 133.489L151.076 129.116L153.646 125.258L153.646 125.258L156.215 121.657L159.298 117.285L162.124 113.427L165.465 109.569L169.062 105.453L173.173 100.052L186.019 86.6775L201.178 73.0458L211.456 65.3297L223.531 56.8419L235.35 50.1547L242.031 46.5538L249.738 42.953L257.446 39.6093L265.154 37.0373L272.349 34.7225L281.084 32.6648L286.994 31.1216L292.646 29.8356L298.299 28.8068L306.264 27.778L312.687 27.0064H318.596H324.763L331.443 27.778L343.776 29.064L356.366 32.6648L367.414 36.0085L380.517 41.6669L389.767 48.097L398.759 56.0703L406.724 65.0725L413.405 75.3606L418.543 83.8483L422.911 93.1076L426.508 101.853L429.334 111.369L432.418 124.744L434.73 138.633L436.272 143.777L441.41 145.834L446.806 147.892Z"
              fill="#26D3DF"
            />
          </svg>
        </div>

        {/* Tagline */}
        <div
          ref={taglineRef}
          className="mt-6 text-center text-slate-400 font-sans tracking-[0.2em] uppercase text-xs md:text-sm whitespace-nowrap overflow-hidden"
        >
          Shaping the Future of Cyber Defense
        </div>
      </div>
    </div>
  );
}
