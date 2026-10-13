import { Fraunces, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SessionWrapper from "../../components/SessionWrapper";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
      ? process.env.NEXTAUTH_URL
      : "https://monetra-rho.vercel.app"
  ),
  title: {
    default: "Monetra — Transparent Crowdfunding & Social Impact",
    template: "%s | Monetra",
  },
  description:
    "Monetra connects generous donors with verified community fundraisers across healthcare, education, emergency relief, and animal welfare.",
  keywords: [
    "crowdfunding",
    "donation platform",
    "fundraising",
    "charity",
    "social impact",
    "NGO donations",
    "healthcare support",
  ],
  authors: [{ name: "Monetra Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://monetra-rho.vercel.app",
    siteName: "Monetra",
    title: "Monetra — Transparent Crowdfunding & Social Impact",
    description:
      "Support verified campaigns, track donation transparency, and create lasting social change.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monetra — Transparent Crowdfunding & Social Impact",
    description:
      "Support verified campaigns, track donation transparency, and create lasting social change.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="min-h-screen flex flex-col bg-(--app-bg) text-(--app-text)">
          <SessionWrapper>
          <Navbar/>
          
          <main className="flex-1">{children}</main>

          <Footer />
         </SessionWrapper>
        </div>
      </body>
    </html>
  );
}
