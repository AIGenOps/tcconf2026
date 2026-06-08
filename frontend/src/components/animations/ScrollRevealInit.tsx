"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Scroll Reveal Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((el) => {
          if (el.isIntersecting) {
            el.target.classList.add("in-view");
            observer.unobserve(el.target); // fire once only
          }
        });
      },
      { threshold: 0.15 } // trigger when 15% visible
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      observer.observe(el);
    });

    // 2. Letter Stagger
    document.querySelectorAll(".reveal-letters").forEach((el) => {
      // Avoid double splitting if already split
      if (el.querySelector(".char")) return;
      
      const text = el.textContent || "";
      el.innerHTML = text
        .split("")
        .map((ch, i) =>
          ch === " "
            ? " "
            : `<span class="char" style="animation-delay:${i * 0.06}s">${ch}</span>`
        )
        .join("");
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
