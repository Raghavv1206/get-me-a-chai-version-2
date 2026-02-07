// C:\Users\ragha\project\get-me-a-chai\app\layout.js

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Get me A Chai - Fund your projects with chai",
  description: "This website is a crowdfunding platform for creators.",
  icons: {
    icon: '/images/tea.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-100 min-h-screen relative overflow-x-hidden selection:bg-purple-500/30">
        <SessionWrapper>
          <SmoothScroll />

          {/* Ambient Background Effects */}
          <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-900/50 via-black to-black pointer-events-none" />
          <div className="fixed top-0 left-0 w-full h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

          <Navbar />

          <main className="relative z-0 min-h-screen flex flex-col">
            {children}
          </main>

          <Footer />

          {/* Global AI Chatbot Widget */}
          <ChatbotWidget />
        </SessionWrapper>
      </body>
    </html>
  );
}