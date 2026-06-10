import { createClient } from "@sanity/client";

// Safe loading of Sanity CMS client
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "pb0ebq7l";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient = projectId && dataset
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2026-06-08",
      useCdn: false,
    })
  : null;

// Mock Data fallbacks to make sure everything works locally without environment config
export interface Speaker {
  name: string;
  designation: string;
  company: string;
  category: "keynote" | "panelist" | "showcase";
  bio: string;
  linkedin?: string;
  avatar?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
  type: "keynote" | "workshop" | "break" | "general" | "panel";
}

export interface FAQ {
  question: string;
  answer: string;
}

const mockSpeakers: Speaker[] = [
  {
    name: "Dr. Elena Rostova",
    designation: "Head of Offensive Research",
    company: "ZeroDay Labs",
    category: "keynote",
    bio: "Elena specializes in kernel-level vulnerability discovery and hardware-assisted hypervisor bypasses. She leads the offensive security group at ZeroDay Labs.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Marcus Vance",
    designation: "Chief Security Architect",
    company: "HyperCloud Security",
    category: "keynote",
    bio: "Marcus is a pioneer in zero-trust container security policies. He is the author of several popular cloud-native container escape mitigations.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Saurabh Sharma",
    designation: "CISO",
    company: "Apex Global FinTech",
    category: "panelist",
    bio: "Saurabh leads risk assessments, vulnerability management, and regulatory compliance programs for enterprise financial systems.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Takahiro Sato",
    designation: "Director of Cyber Threat Intel",
    company: "Securise Inc.",
    category: "panelist",
    bio: "Takahiro manages active threat hunting and espionage correlation research across East Asian critical infrastructure networks.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Aria Sterling",
    designation: "Principal Cryptographer",
    company: "Decentralized Shield",
    category: "showcase",
    bio: "Aria reviews zero-knowledge proof frameworks and smart contract state bypasses. She has audited over 20 top-tier layer-1 blockchains.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Devon Carter",
    designation: "Active Directory Specialist",
    company: "RedTeam Ops",
    category: "showcase",
    bio: "Devon writes automated tools for active-directory forest hijacking and kerberos token harvesting. Regular speaker at international conferences.",
    linkedin: "https://linkedin.com",
  },
];

const mockScheduleDay1: ScheduleItem[] = [
  { time: "09:00 AM - 10:00 AM", title: "Registration & Badge Collection", type: "general" },
  { time: "10:00 AM - 10:30 AM", title: "Opening Ceremony & Welcome Address", type: "general" },
  { time: "10:30 AM - 11:30 AM", title: "Keynote: Advanced Kernel Exploitation & Red Teaming", speaker: "Dr. Elena Rostova", type: "keynote" },
  { time: "11:30 AM - 11:45 AM", title: "Short Refreshment Break", type: "break" },
  { time: "11:45 AM - 12:45 PM", title: "Workshop 1: Active Directory Forest Hijacking Labs", speaker: "Devon Carter", type: "workshop" },
  { time: "12:45 PM - 01:45 PM", title: "Lunch & Professional Networking Session", type: "break" },
  { time: "01:45 PM - 03:45 PM", title: "Hacking Villages Session A: Hardware & Lockpicking Labs", type: "workshop" },
  { time: "01:45 PM - 03:45 PM", title: "Hacking Villages Session B: Cloud Escape Sandbox", type: "workshop" },
  { time: "03:45 PM - 04:00 PM", title: "Tea & Networking Break", type: "break" },
  { time: "04:00 PM - 05:00 PM", title: "Panel Discussion: Future of SecOps in Enterprise Networks", speaker: "Saurabh Sharma & Takahiro Sato", type: "panel" },
  { time: "05:00 PM - 05:45 PM", title: "Networking & Day 1 Ending Ceremony", type: "general" },
  { time: "05:45 PM - 06:00 PM", title: "Attendee Feedback Collection", type: "general" },
];

const mockScheduleDay2: ScheduleItem[] = [
  { time: "09:00 AM - 09:30 AM", title: "Morning Registration & Networking Check-in", type: "general" },
  { time: "09:30 AM - 10:30 AM", title: "Keynote: Zero Trust Container escaping & Blue Team Tactics", speaker: "Marcus Vance", type: "keynote" },
  { time: "10:30 AM - 11:30 AM", title: "Workshop 2: Web3 & Smart Contract Audit Walkthrough", speaker: "Aria Sterling", type: "workshop" },
  { time: "11:30 AM - 01:00 PM", title: "Workshop 3: Custom EDR Bypass Scripting with Go", type: "workshop" },
  { time: "01:00 PM - 02:00 PM", title: "Lunch & Networking Meetups", type: "break" },
  { time: "02:00 PM - 04:00 PM", title: "Hacking Villages Session C: Lockpicking Challenges", type: "workshop" },
  { time: "02:00 PM - 04:00 PM", title: "Hacking Villages Session D: Smart Contract Bypass Arena", type: "workshop" },
  { time: "04:00 PM - 04:30 PM", title: "CTF Solutions Walkthrough & Writeup Reveal", type: "general" },
  { time: "04:30 PM - 05:15 PM", title: "Certificate & Prize Distribution", type: "general" },
  { time: "05:15 PM - 05:45 PM", title: "Closing Remarks & Farewell Address", type: "general" },
  { time: "05:45 PM - 06:00 PM", title: "Final Event Feedback Survey", type: "general" },
];

export async function getSpeakers(): Promise<Speaker[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "speaker"] { name, designation, company, category, bio, linkedin }`;
      const speakers = await sanityClient.fetch(query);
      if (speakers && speakers.length > 0) return speakers;
    } catch (err) {
      console.warn("Sanity fetch failed, falling back to local speakers data:", err);
    }
  }
  return mockSpeakers;
}

export async function getSchedule(dayNum: number): Promise<ScheduleItem[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "schedule" && day == ${dayNum}] | order(orderAsc) { time, title, speaker, type }`;
      const schedule = await sanityClient.fetch(query);
      if (schedule && schedule.length > 0) return schedule;
    } catch (err) {
      console.warn(`Sanity fetch failed, falling back to local schedule Day ${dayNum} data:`, err);
    }
  }
  return dayNum === 1 ? mockScheduleDay1 : mockScheduleDay2;
}

export interface Sponsor {
  name: string;
  link: string;
  logoUrl?: string;
}

export interface Partner {
  name: string;
  link: string;
  logoUrl?: string;
}

const mockFAQs: FAQ[] = [
  {
    question: "Who can attend the ThunderCipher Conference 2026?",
    answer: "The conference is open to everyone interested in cybersecurity. This includes security professionals, developers, researchers, students, and corporate partners looking for security products or talent.",
  },
  {
    question: "Are there any student discounts available?",
    answer: "Yes! We offer a dedicated Student Pass at a heavily discounted rate. You will need to bring a valid student ID card for verification at the registration counter on the event day.",
  },
  {
    question: "What should I bring for the Hacking Villages and Workshops?",
    answer: "You should bring a laptop with a modern web browser and a virtualization environment (like VirtualBox or VMware) installed. We recommend a Kali Linux or Parrot OS environment. For the Hardware Village, all development boards will be provided on-site.",
  },
  {
    question: "How do I participate in the Capture The Flag (CTF) event?",
    answer: "The CTF registration will open a week before the main conference. You can form teams of up to 4 members. CTF details, rule guides, and connection links will be listed on our dedicated CTF subpage.",
  },
  {
    question: "Can I get a certificate of participation?",
    answer: "Yes, all attendees will receive a digitally signed certificate of participation via email. You must verify your attendance at the feedback desk at the end of Day 2 to receive it.",
  },
  {
    question: "What is the cancellation and refund policy?",
    answer: "Tickets are refundable up to 14 days before the conference start date (September 19, 2026). After that date, tickets are non-refundable but can be transferred to another individual by contacting our support team.",
  },
];


export async function getFAQs(): Promise<FAQ[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "faq"] | order(orderAsc) { question, answer }`;
      const faqs = await sanityClient.fetch(query);
      if (faqs && faqs.length > 0) return faqs;
    } catch (err) {
      console.warn("Sanity fetch failed, falling back to local FAQs data:", err);
    }
  }
  return mockFAQs;
}

export async function getSponsors(): Promise<Sponsor[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "sponsor" && visible != false] { name, link, "logoUrl": logo.asset->url }`;
      const sponsors = await sanityClient.fetch(query);
      return sponsors || [];
    } catch (err) {
      console.warn("Sanity fetch failed for sponsors:", err);
    }
  }
  return [];
}

export async function getPartners(): Promise<Partner[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "partner" && visible != false] { name, link, "logoUrl": logo.asset->url }`;
      const partners = await sanityClient.fetch(query);
      return partners || [];
    } catch (err) {
      console.warn("Sanity fetch failed for partners:", err);
    }
  }
  return [];
}
