import React from "react";
import { FiGithub, FiLinkedin, FiFacebook, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Logo from "../assets/logo-full.png"; // dùng lại logo hiện có nếu muốn

// ====== Footer palettes ======
const PALETTES = {
  periwinkle: {
    // xanh tím nhạt – hợp với Header Periwinkle+
    bg: "bg-gradient-to-r from-[#E3E0FF] via-[#D7DBFF] to-[#E3E0FF]",
    border: "border-[#C3C9FF]",
    text: "text-slate-800",
    chip: "bg-white/60 border-white/60 hover:bg-white/80",
    ring: "focus:ring-indigo-300",
    accent: "hover:text-indigo-600",
  },
  sky: {
    // xanh pastel sáng
    bg: "bg-gradient-to-r from-[#EAF2FF] via-[#DBE8FF] to-[#EAF2FF]",
    border: "border-[#C9DAFF]",
    text: "text-slate-800",
    chip: "bg-white/60 border-white/60 hover:bg-white/80",
    ring: "focus:ring-sky-300",
    accent: "hover:text-sky-700",
  },
  navy: {
    // nền xanh đậm
    bg: "bg-gradient-to-r from-[#0F2A43] via-[#0D3B66] to-[#0F2A43]",
    border: "border-white/10",
    text: "text-white/90",
    chip: "bg-white/5 border-white/10 hover:bg-white/10",
    ring: "focus:ring-white/30",
    accent: "hover:text-white",
  },
};

// chọn theme nhanh tại đây
const theme = "periwinkle"; // 'sky' | 'navy'

const cx = (...s) => s.filter(Boolean).join(" ");

const Footer = () => {
  const T = PALETTES[theme];
  return (
    <footer className={cx("relative border-t", T.bg, T.border, T.text,
      "dark:from-[#121833] dark:via-[#0F2236] dark:to-[#121833] dark:border-white/10")}
    >
      {/* glow line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-300 opacity-60" />
      {/* soft radial highlight */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(50%_60%_at_50%_0%,black,transparent)] opacity-60" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Brand + Socials */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-lime-400/20 to-transparent blur-md" />
              <img
                src={Logo}
                alt="SmartFarm"
                className="relative w-10 h-10 rounded-2xl bg-white p-1 ring-1 ring-emerald-500/40 shadow-xl object-contain
                          transition-transform duration-200 hover:scale-105"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight">SmartFarm</span>
              <span className="text-xs opacity-70">Grow smarter, every day</span>
            </div>
          </div>



          <div className="flex items-center gap-3">
            {[
              { href: "https://github.com", icon: <FiGithub /> },
              { href: "https://facebook.com", icon: <FiFacebook /> },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  "p-2 rounded-xl border shadow-sm backdrop-blur transition inline-flex",
                  T.chip,
                  T.ring,
                  "focus:outline-none focus:ring-2"
                )}
                aria-label="social link"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Team</h3>
            <ul className="space-y-1">
              <li>Cao Nguyen Van Truong</li>
              <li>Nguyen Le Anh Duc</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">University</h3>
            <ul className="space-y-1">
              <li>Ho Chi Minh University of Technology</li>
              <li>Ho Chi Minh University of Technology</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="tel:0967413008" className={cx("group w-full sm:w-auto inline-flex items-center gap-3 rounded-2xl px-3 py-2 h-11 min-w-[260px] border shadow-sm backdrop-blur-sm transition hover:shadow text-slate-800/90 dark:text-white/90", T.chip, T.ring, "focus:outline-none focus:ring-2", T.accent)}>
                  <FiPhone className="opacity-70 w-4 h-4" /> 0967 413 008
                </a>
              </li>
              <li>
                <a href="tel:0983779276" className={cx("group w-full sm:w-auto inline-flex items-center gap-3 rounded-2xl px-3 py-2 h-11 min-w-[260px] border shadow-sm backdrop-blur-sm transition hover:shadow text-slate-800/90 dark:text-white/90", T.chip, T.ring, "focus:outline-none focus:ring-2", T.accent)}>
                  <FiPhone className="opacity-70 w-4 h-4" /> 0983 779 276
                </a>
              </li>
              <li className="flex items-start gap-2 opacity-80">
                <FiMapPin className="mt-[2px]" />
                <span>268 Ly Thuong Kiet, District 10, HCMC</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Email</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:truong.caonguyenvan@hcmut.edu.vn" className={cx("group w-full sm:w-auto inline-flex items-center gap-3 rounded-2xl px-3 py-2 h-11 min-w-[260px] border shadow-sm backdrop-blur-sm transition hover:shadow text-slate-800/90 dark:text-white/90", T.chip, T.ring, "focus:outline-none focus:ring-2", T.accent)}>
                  <FiMail className="opacity-70 w-4 h-4" /> truong.caonguyenvan@hcmut.edu.vn
                </a>
              </li>
              <li>
                <a href="mailto:duc.nguyenterabyte13@hcmut.edu.vn" className={cx("group w-full sm:w-auto inline-flex items-center gap-3 rounded-2xl px-3 py-2 h-11 min-w-[260px] border shadow-sm backdrop-blur-sm transition hover:shadow text-slate-800/90 dark:text-white/90", T.chip, T.ring, "focus:outline-none focus:ring-2", T.accent)}>
                  <FiMail className="opacity-70 w-4 h-4" /> duc.nguyenterabyte13@hcmut.edu.vn
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/60 dark:border-white/10 pt-6">
          <p className="text-xs opacity-80">© ABC solution — 2025 SmartFarm. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs opacity-80">
            <a href="#" className="hover:opacity-100">Privacy</a>
            <span className="opacity-40">•</span>
            <a href="#" className="hover:opacity-100">Terms</a>
            <span className="opacity-40">•</span>
            <a href="#" className="hover:opacity-100">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
