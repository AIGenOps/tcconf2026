const { createClient } = require("@sanity/client");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "pb0ebq7l";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error("\x1b[31mError: SANITY_WRITE_TOKEN environment variable is required.\x1b[0m");
  console.log("\nTo import your data, please run this script with a Sanity Write Token:");
  console.log("  \x1b[36mSANITY_WRITE_TOKEN=\"your_write_token\" node importMockData.js\x1b[0m\n");
  console.log("You can get a Write Token from your Sanity Project Dashboard:");
  console.log("  https://www.sanity.io/manage -> Select Project -> API -> Add API token (Permissions: Write)\n");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-06-08",
  useCdn: false,
});

const mockSpeakers = [
  {
    _type: "speaker",
    name: "Dr. Elena Rostova",
    designation: "Head of Offensive Research",
    company: "ZeroDay Labs",
    category: "keynote",
    bio: "Elena specializes in kernel-level vulnerability discovery and hardware-assisted hypervisor bypasses. She leads the offensive security group at ZeroDay Labs.",
    linkedin: "https://linkedin.com",
  },
  {
    _type: "speaker",
    name: "Marcus Vance",
    designation: "Chief Security Architect",
    company: "HyperCloud Security",
    category: "keynote",
    bio: "Marcus is a pioneer in zero-trust container security policies. He is the author of several popular cloud-native container escape mitigations.",
    linkedin: "https://linkedin.com",
  },
  {
    _type: "speaker",
    name: "Saurabh Sharma",
    designation: "CISO",
    company: "Apex Global FinTech",
    category: "panelist",
    bio: "Saurabh leads risk assessments, vulnerability management, and regulatory compliance programs for enterprise financial systems.",
    linkedin: "https://linkedin.com",
  },
  {
    _type: "speaker",
    name: "Takahiro Sato",
    designation: "Director of Cyber Threat Intel",
    company: "Securise Inc.",
    category: "panelist",
    bio: "Takahiro manages active threat hunting and espionage correlation research across East Asian critical infrastructure networks.",
    linkedin: "https://linkedin.com",
  },
  {
    _type: "speaker",
    name: "Aria Sterling",
    designation: "Principal Cryptographer",
    company: "Decentralized Shield",
    category: "showcase",
    bio: "Aria reviews zero-knowledge proof frameworks and smart contract state bypasses. She has audited over 20 top-tier layer-1 blockchains.",
    linkedin: "https://linkedin.com",
  },
  {
    _type: "speaker",
    name: "Devon Carter",
    designation: "Active Directory Specialist",
    company: "RedTeam Ops",
    category: "showcase",
    bio: "Devon writes automated tools for active-directory forest hijacking and kerberos token harvesting. Regular speaker at international conferences.",
    linkedin: "https://linkedin.com",
  },
];

const mockSchedule = [
  { _type: "schedule", day: 1, orderAsc: 1, time: "09:00 AM - 10:00 AM", title: "Registration & Badge Collection", type: "general" },
  { _type: "schedule", day: 1, orderAsc: 2, time: "10:00 AM - 10:30 AM", title: "Opening Ceremony & Welcome Address", type: "general" },
  { _type: "schedule", day: 1, orderAsc: 3, time: "10:30 AM - 11:30 AM", title: "Keynote: Advanced Kernel Exploitation & Red Teaming", speaker: "Dr. Elena Rostova", type: "keynote" },
  { _type: "schedule", day: 1, orderAsc: 4, time: "11:30 AM - 11:45 AM", title: "Short Refreshment Break", type: "break" },
  { _type: "schedule", day: 1, orderAsc: 5, time: "11:45 AM - 12:45 PM", title: "Workshop 1: Active Directory Forest Hijacking Labs", speaker: "Devon Carter", type: "workshop" },
  { _type: "schedule", day: 1, orderAsc: 6, time: "12:45 PM - 01:45 PM", title: "Lunch & Professional Networking Session", type: "break" },
  { _type: "schedule", day: 1, orderAsc: 7, time: "01:45 PM - 03:45 PM", title: "Hacking Villages Session A: Hardware & Lockpicking Labs", type: "workshop" },
  { _type: "schedule", day: 1, orderAsc: 8, time: "01:45 PM - 03:45 PM", title: "Hacking Villages Session B: Cloud Escape Sandbox", type: "workshop" },
  { _type: "schedule", day: 1, orderAsc: 9, time: "03:45 PM - 04:00 PM", title: "Tea & Networking Break", type: "break" },
  { _type: "schedule", day: 1, orderAsc: 10, time: "04:00 PM - 05:00 PM", title: "Panel Discussion: Future of SecOps in Enterprise Networks", speaker: "Saurabh Sharma & Takahiro Sato", type: "panel" },
  { _type: "schedule", day: 1, orderAsc: 11, time: "05:00 PM - 05:45 PM", title: "Networking & Day 1 Ending Ceremony", type: "general" },
  { _type: "schedule", day: 1, orderAsc: 12, time: "05:45 PM - 06:00 PM", title: "Attendee Feedback Collection", type: "general" },

  { _type: "schedule", day: 2, orderAsc: 1, time: "09:00 AM - 09:30 AM", title: "Morning Registration & Networking Check-in", type: "general" },
  { _type: "schedule", day: 2, orderAsc: 2, time: "09:30 AM - 10:30 AM", title: "Keynote: Zero Trust Container escaping & Blue Team Tactics", speaker: "Marcus Vance", type: "keynote" },
  { _type: "schedule", day: 2, orderAsc: 3, time: "10:30 AM - 11:30 AM", title: "Workshop 2: Web3 & Smart Contract Audit Walkthrough", speaker: "Aria Sterling", type: "workshop" },
  { _type: "schedule", day: 2, orderAsc: 4, time: "11:30 AM - 01:00 PM", title: "Workshop 3: Custom EDR Bypass Scripting with Go", type: "workshop" },
  { _type: "schedule", day: 2, orderAsc: 5, time: "01:00 PM - 02:00 PM", title: "Lunch & Networking Meetups", type: "break" },
  { _type: "schedule", day: 2, orderAsc: 6, time: "02:00 PM - 04:00 PM", title: "Hacking Villages Session C: Lockpicking Challenges", type: "workshop" },
  { _type: "schedule", day: 2, orderAsc: 7, time: "02:00 PM - 04:00 PM", title: "Hacking Villages Session D: Smart Contract Bypass Arena", type: "workshop" },
  { _type: "schedule", day: 2, orderAsc: 8, time: "04:00 PM - 04:30 PM", title: "CTF Solutions Walkthrough & Writeup Reveal", type: "general" },
  { _type: "schedule", day: 2, orderAsc: 9, time: "04:30 PM - 05:15 PM", title: "Certificate & Prize Distribution", type: "general" },
  { _type: "schedule", day: 2, orderAsc: 10, time: "05:15 PM - 05:45 PM", title: "Closing Remarks & Farewell Address", type: "general" },
  { _type: "schedule", day: 2, orderAsc: 11, time: "05:45 PM - 06:00 PM", title: "Final Event Feedback Survey", type: "general" }
];

const mockFAQs = [
  {
    _type: "faq",
    orderAsc: 1,
    question: "Who can attend the ThunderCipher Conference 2026?",
    answer: "The conference is open to everyone interested in cybersecurity. This includes security professionals, developers, researchers, students, and corporate partners looking for security products or talent.",
  },
  {
    _type: "faq",
    orderAsc: 2,
    question: "Are there any student discounts available?",
    answer: "Yes! We offer a dedicated Student Pass at a heavily discounted rate. You will need to bring a valid student ID card for verification at the registration counter on the event day.",
  },
  {
    _type: "faq",
    orderAsc: 3,
    question: "What should I bring for the Hacking Villages and Workshops?",
    answer: "You should bring a laptop with a modern web browser and a virtualization environment (like VirtualBox or VMware) installed. We recommend a Kali Linux or Parrot OS environment. For the Hardware Village, all development boards will be provided on-site.",
  },
  {
    _type: "faq",
    orderAsc: 4,
    question: "How do I participate in the Capture The Flag (CTF) event?",
    answer: "The CTF registration will open a week before the main conference. You can form teams of up to 4 members. CTF details, rule guides, and connection links will be listed on our dedicated CTF subpage.",
  },
  {
    _type: "faq",
    orderAsc: 5,
    question: "Can I get a certificate of participation?",
    answer: "Yes, all attendees will receive a digitally signed certificate of participation via email. You must verify your attendance at the feedback desk at the end of Day 2 to receive it.",
  },
  {
    _type: "faq",
    orderAsc: 6,
    question: "What is the cancellation and refund policy?",
    answer: "Tickets are refundable up to 14 days before the conference start date (September 19, 2026). After that date, tickets are non-refundable but can be transferred to another individual by contacting our support team.",
  },
];

async function runImport() {
  console.log(`Connecting to Sanity project \x1b[33m${projectId}\x1b[0m / dataset \x1b[33m${dataset}\x1b[0m...`);

  try {
    // 1. Clear existing speakers, schedule, and faqs
    console.log("\nCleaning existing database entries...");
    await client.delete({ query: '*[_type in ["speaker", "schedule", "faq"]]' });
    console.log("\x1b[32mSuccessfully cleared old entries.\x1b[0m");

    // 2. Import Speakers
    console.log("\nImporting speakers...");
    const speakerPromises = mockSpeakers.map((doc) => client.create(doc));
    await Promise.all(speakerPromises);
    console.log(`\x1b[32mImported ${mockSpeakers.length} speakers.\x1b[0m`);

    // 3. Import Schedule
    console.log("\nImporting schedule items...");
    const schedulePromises = mockSchedule.map((doc) => client.create(doc));
    await Promise.all(schedulePromises);
    console.log(`\x1b[32mImported ${mockSchedule.length} schedule items.\x1b[0m`);

    // 4. Import FAQs
    console.log("\nImporting FAQs...");
    const faqPromises = mockFAQs.map((doc) => client.create(doc));
    await Promise.all(faqPromises);
    console.log(`\x1b[32mImported ${mockFAQs.length} FAQ items.\x1b[0m`);

    console.log("\n\x1b[32;1mAll mock data successfully populated in Sanity CMS!\x1b[0m");
    console.log("Your frontend website is now connected and populated with Sanity content.");

  } catch (error) {
    console.error("\x1b[31mFailed to import mock data to Sanity:\x1b[0m", error);
  }
}

runImport();
