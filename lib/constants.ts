import { DownloadItem, StaffMember } from "@/lib/types";

export const navigationLinks = [
  { href: "#home", label: "Home" },
  { href: "#gallery", label: "Gallery" },
  { href: "#events", label: "Events" },
  { href: "#notices", label: "Notices" },
  { href: "#staff", label: "Staff" },
  { href: "#contact", label: "Contact" }
];

export const fallbackHeroSlides = [
  {
    id: "hero-1",
    url: "/images/New Building.jpeg",
    alt: "A Campus Designed to Inspire Learning and Growth"
  },
  {
    id: "hero-2",
    url: "/images/indoor_corridor.jpeg",
    alt: "Where Curiosity Comes Alive"
  },
  {
    id: "hero-3",
    url: "/images/X_mas.JPG",
    alt: "Spreading Joy, Learning and cheer"
  },
  {
    id: "hero-4",
    url: "/images/Republic_day.jpeg",
    alt: "Proud to Learn, Proud to Be Indian"
  }
];

export const staffMembers: StaffMember[] = [
  {
    id: "staff-1",
    name: "Anita Verma",
    subject: "Mathematics",
    bio: "Guides students with concept-first problem solving and Olympiad readiness.",
    photo:
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "staff-2",
    name: "Rahul Sharma",
    subject: "Science",
    bio: "Leads practical, lab-based learning focused on curiosity and experimentation.",
    photo:
      "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "staff-3",
    name: "Meera Nair",
    subject: "English",
    bio: "Builds communication confidence through literature circles and debates.",
    photo:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "staff-4",
    name: "Arjun Menon",
    subject: "Computer Science",
    bio: "Mentors coding clubs and project-based learning for future-ready skills.",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80"
  }
];

export const downloadItems: DownloadItem[] = [
  {
    id: "download-1",
    title: "Admission Brochure 2026",
    date: "2026-02-10",
    fileUrl: "/downloads/admission-brochure.pdf"
  },
  {
    id: "download-2",
    title: "Fee Structure 2026-27",
    date: "2026-03-01",
    fileUrl: "/downloads/fee-structure.pdf"
  },
  {
    id: "download-3",
    title: "Transport Routes",
    date: "2026-03-15",
    fileUrl: "/downloads/transport-routes.pdf"
  }
];
