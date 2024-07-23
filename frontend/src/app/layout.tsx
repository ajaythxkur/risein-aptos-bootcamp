import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Bootstrap } from "@/context/Bootstrap";
import Link from "next/link";
import dynamic from "next/dynamic";
import { WalletProvider } from "@/context/WalletProvider";
import { Toaster } from "react-hot-toast";
const font = Josefin_Sans({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Aptos Blogs",
  description: "Created by ajaythxkur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <WalletProvider>
          <Header />
          <hr />
          {children}
          <Footer />
        </WalletProvider>
        <Bootstrap />
        <Toaster 
          position="top-right"
        />
      </body>
    </html>
  );
}


function Header() {
  return (
    <nav className="py-3 px-2">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link href={"/"} className="fw-bold text-info fs-4">Aptos Blogs</Link>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  )
}

const WalletConnectButton = dynamic(
  async () => {
    const { WalletConnectButton } = await import("@/components/WalletConnectButton");
    return { default: WalletConnectButton };
  },
  {
    loading: () => (
      <button className="btn btn-info" disabled>
        Loading...
      </button>
    ),
    ssr: false,
  }
);

function Footer(){
  return(
    <footer className="py-3 d-flex justify-content-center">
      <Link href={"https://github.com/ajaythxkur/risein-aptos-bootcamp"} target="_blank" className="text-center">Github</Link>
    </footer>
  )
}