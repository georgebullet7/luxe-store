import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { normalizeLebanesePhone } from "@/lib/phone";

export function waLink(phone: string): string | null {
  const normalized = normalizeLebanesePhone(phone) ?? (phone.startsWith("+") ? phone : null);
  if (!normalized) return null;
  return `https://wa.me/${normalized.replace("+", "")}`;
}

export function tgLink(username: string): string | null {
  const u = username.replace(/^@/, "").trim();
  if (!u) return null;
  return `https://t.me/${u}`;
}

/** Footer "Chat with us" links (WhatsApp / Telegram). */
export function SupportLinks({
  whatsapp,
  telegram,
}: {
  whatsapp?: string;
  telegram?: string;
}) {
  const wa = whatsapp ? waLink(whatsapp) : null;
  const tg = telegram ? tgLink(telegram) : null;
  if (!wa && !tg) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold">Chat with us</h4>
      <div className="mt-3 flex gap-2">
        {wa && (
          <Link
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Link>
        )}
        {tg && (
          <Link
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Telegram
          </Link>
        )}
      </div>
    </div>
  );
}

/** Floating WhatsApp bubble, bottom-left on every page. */
export function WhatsAppBubble({ whatsapp }: { whatsapp?: string }) {
  const wa = whatsapp ? waLink(whatsapp) : null;
  if (!wa) return null;
  return (
    <Link
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-soft-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </Link>
  );
}
