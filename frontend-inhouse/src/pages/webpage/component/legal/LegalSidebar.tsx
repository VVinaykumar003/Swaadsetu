// components/legal/LegalSidebar.tsx
import React from "react";

const links = [
  {
    href: "#privacy",
    icon: "fa-solid fa-fingerprint",
    label: "Privacy Policy",
  },
  {
    href: "#compliance",
    icon: "fa-solid fa-shield-virus",
    label: "Compliance & Security",
  },
  {
    href: "#terms",
    icon: "fa-solid fa-file-invoice",
    label: "Terms & Conditions",
  },
  {
    href: "#refund",
    icon: "fa-solid fa-wallet",
    label: "Refund & Cancellation",
  },

];

const LegalSidebar: React.FC = () => {
  return (
    <aside className="sticky top-8 hidden h-fit w-80 shrink-0 lg:block">
      <div className="rounded-2xl bg-[#0F0F0F] p-7 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
        <h4 className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gray-500">
          Documents
        </h4>

        <ul className="space-y-2 text-sm">
          {links.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
              >
                <i
                  className={`${item.icon} mr-3 text-base transition-transform group-hover:scale-110`}
                />
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFBE00] px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-[#0F0F0F] shadow-[0_10px_20px_rgba(255,190,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
        >
          <i className="fa-solid fa-cloud-download-alt" />
          Print Legal PDF
        </button>
      </div>
    </aside>
  );
};

export default LegalSidebar;
