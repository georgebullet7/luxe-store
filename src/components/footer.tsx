import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

const columns = [
  { title: "Shop", links: [["All products", "/shop"], ["Audio", "/shop?category=audio"], ["Wearables", "/shop?category=wearables"], ["Footwear", "/shop?category=footwear"]] },
  { title: "Company", links: [["About", "/about"], ["Careers", "/careers"], ["Sustainability", "/sustainability"], ["Press", "/press"]] },
  { title: "Support", links: [["Contact", "/contact"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["FAQ", "/faq"]] },
];

export function Footer({ storeName = "LUXE", tagline = "Premium essentials, designed to last. Free carbon-neutral shipping on every order." }: { storeName?: string; tagline?: string }) {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="text-lg font-bold tracking-tight">{storeName}<span className="text-accent">.</span></Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{tagline}</p>
          <div className="mt-6"><NewsletterForm /></div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
