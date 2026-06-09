"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { name: "Speakers", href: "/speakers" },
  { name: "Schedule", href: "/schedule" },
  { name: "CTF", href: "/ctf" },
  { name: "Sponsors", href: "/#sponsors" },
  { name: "Venue", href: "/venue" },
  { name: "FAQ", href: "/#faq" },
  { name: "contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Fixed Top-Left Logo */}
      <div className="fixed top-6 left-6 md:left-10 z-50">
        <Link href="/" className="flex items-center group">
          <svg className="h-8 w-auto text-thunder-cyan transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" viewBox="120 0 753 657" fill="currentColor">
            <path d="M137.254 654.726L134.98 652.169V649.611V649.611V646.769L136.401 645.064L138.106 643.075L162.26 628.298L179.026 616.079L188.688 606.986L196.077 596.187L206.307 576.58L210.569 566.065L213.411 555.551L216.537 539.638L219.094 523.156L222.22 503.832L223.073 483.372L224.209 428.243L223.925 372.83L223.357 289.853V248.932L223.073 207.159L222.504 152.599V125.603L222.22 111.963L221.936 98.3226L215.116 97.7542L205.454 96.9017L196.077 96.6176H182.721H170.217H150.325L136.401 97.1859L124.182 98.0384L108.268 99.1751L101.164 100.312L90.6499 101.733L78.4306 104.574L70.1897 107.416L61.3805 111.11L52.8554 115.373L44.6145 119.635L29.8377 130.15L22.7335 136.401L15.061 142.937L11.3668 145.211L6.25172 148.336L0 151.462L1.98918 140.664L3.6942 130.15L7.10422 116.509L13.3559 100.312L21.3127 86.1033L32.1111 73.3157L51.7188 57.6864L70.1897 48.3088L95.1966 40.6362L119.351 38.0787L136.117 37.2262H171.922H198.35H239.839L269.392 37.7945H287.863H307.187H324.805L342.708 38.3629L369.42 39.4995L394.142 40.0679L420.57 40.6362L437.904 40.9204L459.217 40.6362L480.53 38.3629L500.422 34.3845L517.472 29.2694L532.248 21.3127L547.594 10.5143L560.097 0L559.529 5.39922L556.403 18.471L551.004 32.9636L540.205 55.1288L520.882 70.474L473.141 96.3334L438.189 104.858L395.847 108.269L328.215 107.416V315.428L328.783 369.988V450.124L330.204 529.692V571.18L328.783 590.22L327.647 606.417L325.089 613.237L319.974 619.489L314.007 624.32L304.345 630.856L295.252 636.255L284.737 641.086L274.507 644.496L263.709 647.906L252.91 650.464L236.713 653.021L220.515 654.726L208.864 656.147L196.929 656.999H169.081H153.735L139.527 656.431L137.254 654.726Z" />
            <path d="M847.307 260.392L851.932 259.621L850.647 243.417L849.362 222.069L847.307 197.12L842.939 179.631L836.773 163.17L830.863 151.338L823.412 140.278L814.419 130.248L803.885 121.76L788.726 115.33L781.018 113.015L770.741 112.5H758.151H746.589H715.5H686.724L668.482 114.558L653.066 117.13L630.456 122.274L615.04 127.418L593.2 135.134L576.5 143.879L554.661 154.939L537.96 165.484L521.002 176.801L505.329 188.633L490.17 201.236L477.581 213.839L465.248 227.728L453.686 241.102L447.006 251.133L441.867 259.364L436.728 268.623L432.361 277.368L423.882 295.372L417.972 313.119L413.861 324.693L410.521 336.267L406.924 348.356L404.869 360.959L402.813 370.475L401.529 379.735L401.015 397.739L400.501 425.003L403.584 452.266L410.264 484.931L416.688 502.421L422.854 518.367L437.242 544.602L445.978 558.748L455.485 571.351L466.533 584.211L478.865 596.3L492.997 607.874L507.385 618.934L521.259 626.907L536.675 634.366L552.348 641.053L561.598 644.14L572.389 647.998L580.354 650.056L588.062 651.599L597.054 653.142L608.616 654.685L619.151 655.714L629.942 656.228L641.504 656.743L653.066 657L673.62 655.2L684.668 653.399L695.717 651.084L704.966 647.998L713.445 645.169L721.924 641.825L731.43 637.967L763.29 618.42L787.185 600.158L806.454 582.411L814.676 572.895L823.669 562.349L838.057 542.544L851.161 521.454L870.431 485.703L873 480.044V476.186L871.458 472.842L869.917 470.785L867.604 468.47L864.264 467.698L860.667 469.242L850.133 484.159L839.342 498.82L828.294 513.223L816.989 526.598L801.83 541.001L785.9 552.833L768.172 564.921L750.186 574.695L733.743 581.639L716.528 586.783L700.598 590.899L692.376 591.67H684.155H673.877L664.114 591.156L653.58 589.613L645.101 587.555L636.879 586.269L628.4 583.44L619.664 580.868L612.213 577.524L602.707 573.409L594.485 569.036L585.492 563.378L577.784 557.205L568.535 550.775L560.57 543.059L553.119 534.314L546.182 524.54L540.272 516.824L534.877 508.079L529.481 498.82L525.37 488.532L520.489 477.986L516.891 467.441L513.294 456.896L510.468 444.293L508.156 423.717L507.128 401.083L507.642 382.05L509.183 362.759L509.697 352.728L511.496 342.183L513.551 332.409L516.635 322.121L518.626 313.875L521.259 304.117L523.829 295.115L527.426 286.884L531.794 276.082L535.904 268.366L539.245 262.193L543.099 255.248L549.008 245.989L551.004 241.617L554.147 237.759L556.716 234.158L559.799 229.785L562.625 225.927L565.966 222.069L569.563 217.954L573.674 212.553L586.52 199.178L601.679 185.546L611.957 177.83L624.032 169.342L635.851 162.655L642.531 159.054L650.239 155.453L657.947 152.11L665.655 149.538L672.85 147.223L681.585 145.165L687.495 143.622L693.147 142.336L698.8 141.307L706.765 140.278L713.188 139.507H719.097H725.264L731.944 140.278L744.277 141.564L756.867 145.165L767.915 148.509L781.018 154.167L790.268 160.598L799.26 168.571L807.225 177.573L813.906 187.861L819.044 196.349L823.412 205.608L827.009 214.353L829.835 223.87L832.919 237.244L835.231 251.133L836.773 256.277L841.911 258.335L847.307 260.392Z" />
          </svg>
        </Link>
      </div>

      {/* Floating Centered Header Wrapper */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 px-4 md:px-8 py-4 ${
          scrolled ? "top-2" : "top-0"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? "glass-panel shadow-[0_10px_30px_-10px_rgba(0,82,255,0.15)] max-w-5xl"
              : "bg-transparent border-b border-transparent"
          }`}
        >
          <div className="w-28 hidden lg:block" />
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative px-4 py-2 text-xs font-medium tracking-wider transition-colors duration-300 ${
                    isActive ? "text-thunder-cyan font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {hoveredIndex === idx && (
                    <motion.span
                      layoutId="navHover"
                      className="absolute inset-0 bg-white/5 rounded-full z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Call to Action Button / Menu Toggle */}
          <div className="flex items-center space-x-3">
            <Link
              href="/tickets"
              className="hidden md:inline-flex items-center space-x-1 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border border-thunder-blue/40 bg-thunder-blue/10 hover:bg-thunder-blue hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,82,255,0.2)] hover:shadow-[0_0_25px_rgba(0,82,255,0.4)]"
            >
              <span>Tickets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full border border-white/10 hover:bg-white/5 lg:hidden text-slate-300 hover:text-white transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-[#030303]/98 backdrop-blur-xl flex flex-col justify-center px-8"
          >
            <div className="flex flex-col space-y-6 max-w-md mx-auto w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block text-2xl font-bold tracking-widest text-slate-300 hover:text-thunder-cyan transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-6 border-t border-white/10"
              >
                <Link
                  href="/tickets"
                  className="w-full justify-center inline-flex items-center space-x-2 px-6 py-4 rounded-full text-sm font-bold tracking-wider uppercase bg-thunder-blue text-white shadow-glow-blue"
                >
                  <span>Register & Buy Ticket</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Ticket CTA (fixed bottom-right corner) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          href="/tickets"
          className="group relative flex items-center justify-center p-4 md:p-5 rounded-full bg-[#070913] border border-thunder-blue/40 shadow-glow-blue hover:shadow-glow-blue-lg hover:border-thunder-blue transition-all duration-300"
        >
          <div className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full bg-thunder-cyan text-[#030303] text-[9px] font-bold tracking-wider animate-pulse-slow">
            42 left
          </div>
          <svg
            className="w-5 h-5 text-thunder-cyan group-hover:scale-110 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46s-.81-2.77-2-3.46V6h16v2.54z M11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z" />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 text-xs font-bold tracking-widest text-slate-100 uppercase transition-all duration-500 whitespace-nowrap">
            Buy Ticket
          </span>
        </Link>
      </motion.div>
    </>
  );
}
