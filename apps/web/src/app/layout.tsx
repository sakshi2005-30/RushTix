import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RushTix — Find your next live moment", template: "%s · RushTix" },
  description: "Discover upcoming live music and book your seat with RushTix.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
