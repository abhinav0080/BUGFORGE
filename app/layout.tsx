import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"BugForge — Learn. Hunt. Verify.", description:"Your hands-on path from beginner to security researcher. Guided labs, investigations, and a mentor beside you.", icons:{icon:"/favicon.svg"} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" className="dark"><body>{children}</body></html>; }
