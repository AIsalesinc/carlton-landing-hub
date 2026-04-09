"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "News", href: "#news" },
  { label: "Events", href: "#events" },
  { label: "Dining", href: "#dining" },
  { label: "Links", href: "#links" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 nav-blur ${
        scrolled ? "bg-[#20292C]/95 shadow-sm border-b border-[#616566]" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-3">
          <svg viewBox="0 0 139.89 157.21" className="w-8 h-8" fill="none">
            <path fill="#26ACE8" d="M132.16,91.12l-15.19-8.77c-3.74-2.16-3.74-5.69,0-7.84l14.58-8.42c3.74-2.16,6.79-7.45,6.79-11.77v-26.59c0-4.31-3.06-9.61-6.79-11.77l-23.03-13.3c-3.74-2.16-9.85-2.16-13.59,0l-23.03,13.3c-3.74,2.16-6.79,7.45-6.79,11.77v16.14c0,4.31-3.06,6.08-6.79,3.92l-13.97-8.07c-3.74-2.16-9.85-2.16-13.59,0l-23.03,13.3c-3.74,2.16-6.79,7.45-6.79,11.77v26.59c0,4.31,3.06,9.61,6.79,11.77l23.03,13.3c3.74,2.16,9.85,2.16,13.59,0l14.58-8.42c3.74-2.16,6.79-.39,6.79,3.92v17.54c0,4.31,3.06,9.61,6.79,11.77l23.03,13.3c3.74,2.16,9.85,2.16,13.59,0l23.03-13.3c3.74-2.16,6.79-7.45,6.79-11.77v-26.59c0-4.31-3.06-9.61-6.79-11.77ZM104.55,83.15c0,1.67-1.18,3.72-2.63,4.56l-24.04,13.88c-1.45.84-3.81.84-5.26,0l-8.92-5.15c-1.45-.84-2.63-2.89-2.63-4.56v-27.76c0-1.67,1.18-3.72,2.63-4.56l8.92-5.15c1.45-.84,3.81-.84,5.26,0l24.04,13.88c1.45.84,2.63,2.89,2.63,4.56v10.3Z"/>
          </svg>
          <span className="font-semibold text-lg tracking-tight text-white">
            RevFirma
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#999999] hover:text-[#26ACE8] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#2a353a] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#20292C]/95 nav-blur border-t border-[#616566] px-6 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-[#999999] hover:text-[#26ACE8]"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
