export const siteConfig = {
  name: "DM Public School",
  shortName: "DMPS",
  tagline: "Shaping Future Leaders",
  description:
    "DM Public School is dedicated to academic excellence, modern learning, and building confident future leaders.",
  logo: {
    mode: "placeholder" as "placeholder" | "image",
    imagePath: "/logo.svg",
    style: "shield" as "shield" | "circle"
  },
  contact: {
    email: "info@dmpublicschool.edu",
    phone: "+91 99999 99999",
    address: "DM Public School, Civil Lines, New Delhi"
  },
  socials: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999"
  }
};

