import React from "react";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import WhyAttend from "@/components/sections/WhyAttend";
import Villages from "@/components/sections/Villages";
import Sponsors from "@/components/sections/Sponsors";
import FAQ from "@/components/sections/FAQ";

import { getFAQs, getSponsors, getPartners } from "@/lib/sanity";

export const revalidate = 0; // Disable cache for instant update

export default async function Home() {
  const faqs = await getFAQs();
  const sponsors = await getSponsors();
  const partners = await getPartners();

  return (
    <>
      <Hero />
      <Stats />
      <WhyAttend />
      <Villages />
      <Sponsors initialSponsors={sponsors} initialPartners={partners} />
      <FAQ initialFAQs={faqs} />
    </>
  );
}
