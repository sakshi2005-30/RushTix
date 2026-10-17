"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, LogOut, Menu, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;
    api.me().then((current) => { if (active) setUser(current); }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api.logout();
      setUser(null);
      router.push("/events");
      router.refresh();
    } catch (error) {
      setLoggingOut(false);
      setLogoutError(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/events" className="brand" aria-label="RushTix home" onClick={closeMenu}>
          <span className="brand-mark"><Ticket size={17} strokeWidth={2.2} /></span>
          <span>rush<span className="brand-light">tix</span></span>
        </Link>
        <button className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <Link href="/events" className={pathname.startsWith("/events") ? "nav-link active" : "nav-link"} onClick={closeMenu}>
            <CalendarDays size={16} /> Events
          </Link>
          {user ? (
            <>
              <Link href="/bookings" className={pathname === "/bookings" ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                <Ticket size={16} /> My bookings
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin/events" className={pathname.startsWith("/admin/events") ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                  <CalendarDays size={16} /> Manage Events
                </Link>
              )}
              <div className="nav-account">
                <span className="avatar">{user.name.trim().slice(0, 1).toUpperCase()}</span>
                <span className="account-name">{user.name}</span>
                <button className="logout-button" onClick={handleLogout} disabled={loggingOut} aria-label="Sign out">
                  {loggingOut ? <span className="spinner small" /> : <LogOut size={16} />}
                </button>
              </div>
              {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
            </>
          ) : (
            <Link href="/login" className="nav-signin" onClick={closeMenu}>Sign in <ArrowUpRight size={15} /></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
