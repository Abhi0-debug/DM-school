export const siteConfig = {
  name: "D.M. Public School,Puri",
  shortName: "DMPS",
  tagline: "Commited To Serve",
  description:
    "D.M. Public School is dedicated to academic excellence, modern learning, and building confident future leaders.",
  logo: {
    mode: "image",
    imagePath: "/CICA LOGO 3.png",
    style: "circle"
  },
  contact: {
    email: "dmpublicschoolpuri@gmail.com",
    phone: "+91 99999 99999",
    address: "D.M. Public School, Plot no 408, Puri 1, beside Hanuman Temple, near Dr.Baren Pattanaik Eye Clinic, Duttatota, Puri, Odisha 752001"
  },
  socials: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/"
  }
};

