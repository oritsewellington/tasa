import { Link } from "react-router-dom";
import { Drama, Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react";

const DISPLAY_FONT = { fontFamily: "'Playfair Display', Georgia, serif" };

export default function Footer() {
  return (
    <footer className="bg-[#120D0C] text-[#B8AC9A]">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8A2C42] to-[#3D0B14] rounded-sm flex items-center justify-center ring-1 ring-[#C7A34C]/40">
                <Drama size={16} className="text-[#F4ECDA]" />
              </div>
              <div>
                <span
                  style={DISPLAY_FONT}
                  className="font-bold italic text-[#F4ECDA] text-lg"
                >
                  TASA Awards
                </span>
                <span className="text-[#C7A34C] text-xs ml-2">2026</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-[#8A7A64]">
              Theatre Arts Student Association, University of Benin. 23 award
              categories celebrating excellence, talent, and leadership.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                {
                  icon: Instagram,
                  href: "https://instagram.com/tasa_uniben",
                },
                {
                  icon: Twitter,
                  href: "https://twitter.com/tasa_uniben",
                },
                {
                  icon: Facebook,
                  href: "https://facebook.com/tasa_uniben",
                },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm bg-[#241A15] hover:bg-[#6E1423] flex items-center justify-center transition-colors group"
                >
                  <Icon
                    size={15}
                    className="text-[#8A7A64] group-hover:text-[#F4ECDA] transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#F4ECDA] font-semibold text-sm mb-4">
              Quick links
            </h4>
            <ul className="space-y-2.5">
              {[
                ["/", "Home"],
                ["/events", "All events"],
                ["/about", "About TASA"],
                ["/contact", "Contact"],
                ["/login", "Admin login"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-[#8A7A64] hover:text-[#C7A34C] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#F4ECDA] font-semibold text-sm mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[#8A7A64]">
                <Mail
                  size={14}
                  className="mt-0.5 text-[#C7A34C] flex-shrink-0"
                />
                <a
                  href="mailto:akitikori.wellington@gmail.com"
                  className="hover:text-[#C7A34C] transition-colors"
                >
                  akitikori.wellington@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[#8A7A64]">
                <Phone
                  size={14}
                  className="mt-0.5 text-[#C7A34C] flex-shrink-0"
                />

                <a
                  href="tel:07078588361"
                  className="hover:text-[#C7A34C] transition-colors"
                >
                  07078588361
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#3A2A20] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C4A3A]">
          <p>© {new Date().getFullYear()} TASA Awards. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
