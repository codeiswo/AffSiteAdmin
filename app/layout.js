import "./globals.css";

export const metadata = {
  title: "SitesPro | Affiliate Site Builder Panel",
  description: "Automated site generator and multi-tenant Cloudflare orchestrator dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>{children}</body>
    </html>
  );
}
