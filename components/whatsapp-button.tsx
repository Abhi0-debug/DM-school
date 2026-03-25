import { MessageCircleMore } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function WhatsAppButton() {
  const phone = siteConfig.socials.whatsapp.replace(/\D/g, "");
  const href = `https://wa.me/${phone}?text=Hello%20DM%20Public%20School`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02] hover:bg-emerald-600"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircleMore className="h-4 w-4" />
      WhatsApp
    </a>
  );
}
