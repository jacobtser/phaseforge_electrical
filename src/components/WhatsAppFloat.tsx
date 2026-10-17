import { site, waLink } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

export function WhatsAppFloat() {
  const href = waLink(
    `Hello ${site.shortName}, I'd like to enquire about your electrical services.`,
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-[#052e16] shadow-[0_10px_35px_-8px_rgba(37,211,102,0.8)] transition-transform hover:-translate-y-0.5"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
