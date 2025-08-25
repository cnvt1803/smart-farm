import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut, FiSearch, FiSettings, FiUser, FiSun, FiMoon } from "react-icons/fi";
import AccountSettings from "../components/AccountSettings";
import { API_BASE_URL } from "../config";
import Logo from "../assets/logo-full.png";

// Small helpers
const getInitials = (name = "User") => name
  .split(" ")
  .filter(Boolean)
  .map(p => p[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

const classNames = (...arr) => arr.filter(Boolean).join(" ");


const PALETTES = {
  sky: {
    brand: "text-sky-700",
    ring: "focus:ring-sky-400",
    border: "border-sky-100",
    btn: "border-sky-100 hover:bg-sky-50/70",
    avatar: "from-sky-400 to-blue-500"
  },
  garden: {
    brand: "text-emerald-700",
    ring: "focus:ring-emerald-400",
    border: "border-emerald-100",
    btn: "border-emerald-100 hover:bg-emerald-50/70",
    avatar: "from-emerald-400 to-green-500"
  },
  slate: {
    brand: "text-slate-700",
    ring: "focus:ring-slate-400",
    border: "border-slate-200",
    btn: "border-slate-200 hover:bg-slate-100/70",
    avatar: "from-slate-400 to-slate-600"
  }
};

// chọn nhanh tại đây
const palette = 'sky';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // --- Fetch user profile once on mount ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Bạn chưa đăng nhập");
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Không lấy được thông tin người dùng");
        if (!cancelled) setUserName(data.full_name || "");
      } catch (err) {
        if (!cancelled) setError(err.message);
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // --- Close dropdown on outside click / Esc ---
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // --- React to token changes from other tabs ---
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access_token") window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // --- Theme toggle ---
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      const isDark = saved === "dark";
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50
        backdrop-blur-xl text-slate-800
        bg-gradient-to-r from-[#E3E0FF] via-[#D7DBFF] to-[#E3E0FF]
        border-b border-[#C3C9FF]
        dark:from-[#121833]/75 dark:via-[#0F2236]/70 dark:to-[#121833]/75 dark:text-white dark:border-white/10">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="relative group shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
              aria-label="SmartFarm Home"
            >
              {/* Halo phía sau logo */}
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-lime-400/20 to-transparent blur-md opacity-90 group-hover:opacity-100 transition" />
              {/* Ảnh logo */}
              <img
                src={Logo}
                alt="Logo"
                className="relative w-10 h-10 rounded-2xl bg-white p-1 ring-1 ring-emerald-500/40 shadow-xl object-contain
                          transition-transform duration-200 hover:scale-105 dark:bg-white/90 dark:ring-emerald-400/50"
              />
            </Link>

            <Link to="/" className={classNames("hidden sm:block text-xl font-semibold tracking-tight font-dancing", PALETTES[palette].brand)}>
              SmartFarm
            </Link>
          </div>

          {/* Center: Search (md+) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
              <input
                type="search"
                placeholder="Tìm thiết bị, khu vườn, bản ghi…"
                className={classNames("w-full pl-10 pr-3 py-2 rounded-xl border bg-white/70 dark:bg-neutral-900/70 shadow-sm focus:outline-none focus:ring-2", PALETTES[palette].border, "dark:border-neutral-700", PALETTES[palette].ring)}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={classNames("p-2 rounded-xl border focus:outline-none focus:ring-2 dark:border-neutral-700 dark:hover:bg-white/5", PALETTES[palette].btn, PALETTES[palette].ring)}
            >
              {dark ? <FiSun /> : <FiMoon />}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
            >
              <FiBell />
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] px-1 bg-red-500 text-white">3</span>
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                className={classNames("flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl border focus:outline-none focus:ring-2 dark:border-neutral-700 dark:hover:bg-white/5", PALETTES[palette].btn, PALETTES[palette].ring)}
              >
                {/* Avatar */}
                <div className={classNames("w-9 h-9 rounded-2xl bg-gradient-to-br text-white grid place-items-center font-semibold shadow-sm overflow-hidden", PALETTES[palette].avatar)}>
                  {/* If you later have a real avatar URL, replace this div with <img className="w-9 h-9 rounded-2xl object-cover" src={avatarUrl} alt="avatar" /> */}
                  <span className="select-none text-sm">{getInitials(userName || "User")}</span>
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium max-w-[10rem] truncate">{loading ? "Đang tải…" : (userName || "—")}</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Administrator</span>
                </div>
                <FiChevronDown className="hidden sm:block opacity-70" />
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
                >
                  <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {error ? <span className="text-red-500">{error}</span> : "Tài khoản"}
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => { setShowAccountSettings(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <FiSettings /> Cài đặt tài khoản
                  </button>
                  {/* <Link
                    role="menuitem"
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <FiUser /> Hồ sơ của tôi
                  </Link> */}
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                  <button
                    role="menuitem"
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/20 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
            <button
              onClick={() => setShowAccountSettings(false)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xl"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="p-6">
              <AccountSettings />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
