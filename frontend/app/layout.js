import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
// import NextTopLoader from 'nextjs-toploader';

const jakarta_sans = Plus_Jakarta_Sans({
  variable: "--font-plusjakarta",
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: "Splitzer",
  description: "Bill Splitting made easy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta_sans.variable} scroll-smooth`}>
      <body className="">
        <Header />
        {children}
      </body>
    </html>
  );
}
