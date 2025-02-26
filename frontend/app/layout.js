import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { GoogleAnalytics } from '@next/third-parties/google'
import Footer from "@/components/Footer";

const jakarta_sans = Plus_Jakarta_Sans({
  variable: "--font-plusjakarta",
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: "Splitzer - Split expenses for shared expenses",
  description: "An easy, reliable and quick tool to split your expenses as a group after any outings in any ratio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta_sans.variable} scroll-smooth selection:text-[#A7EE43]`}>
      <GoogleAnalytics gaId="G-265MDF3GQN" />
      <body className="">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
