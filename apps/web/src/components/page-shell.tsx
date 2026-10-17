import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="main-shell">{children}</main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} RushTix</span><span>Make room for the music.</span></footer>
    </>
  );
}
