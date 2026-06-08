import React from "react";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import WhyAttend from "@/components/sections/WhyAttend";
import Villages from "@/components/sections/Villages";
import Sponsors from "@/components/sections/Sponsors";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <WhyAttend />
      <Villages />
      <Sponsors />
      <FAQ />
    </>
  );
}
