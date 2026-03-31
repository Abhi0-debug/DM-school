import { MessageCircleMore } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function WhatsAppButton() {
  const rawPhone = siteConfig.socials.whatsapp.replace(/\D/g, "");
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const href = `https://wa.me/${phone}?text=Hello%20DM%20Public%20School`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-3 z-50 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02] hover:bg-emerald-600 sm:bottom-5 sm:right-5"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircleMore className="h-4 w-4" />
      WhatsApp
    </a>
  );
}
