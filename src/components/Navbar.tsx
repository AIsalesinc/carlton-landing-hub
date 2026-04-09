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
        scrolled ? "bg-white/90 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <svg viewBox="0 0 28 28" className="w-7 h-7 text-blue-600" fill="currentColor">
            <path d="M14 2C7.373 2 2 6.925 2 13c0 3.38 1.65 6.41 4.243 8.5C6.09 23.66 5 25.2 5 25.2s3.72-.8 5.8-2.3c.98.22 2.02.34 3.1.34 6.627 0 12-4.925 12-11S20.627 2 14 2z" opacity=".15"/>
            <path d="M14 4C8.477 4 4 8.03 4 13c0 2.87 1.5 5.43 3.84 7.1l.5.36-.2.6c-.33.97-.85 1.85-1.37 2.55.95-.33 2-.82 2.84-1.44l.48-.35.57.13c1.06.24 2.2.37 3.34.37 5.523 0 10-4.03 10-9s-4.477-9-10-9z"/>
            <circle cx="9.5" cy="13" r="1.5" fill="white"/>
            <circle cx="14" cy="13" r="1.5" fill="white"/>
            <circle cx="18.5" cy="13" r="1.5" fill="white"/>
          </svg>
          <span className="font-semibold text-lg tracking-tight text-slate-900">
            Carlton Landing Hub
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden bg-white/95 nav-blur border-t border-slate-100 px-6 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-slate-600 hover:text-blue-600"
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
