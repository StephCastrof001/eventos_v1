import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Space Grotesk = fuente de marca HACK IA (misma del badge). Cohesión form→badge.
const spaceGrotesk = Space_Grotesk({
	variable: "--font-sans",
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "HACK IA · Eventos",
	description:
		"Registro, badge y check-in para eventos de la comunidad HACK IA.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="es"
			className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-sans">{children}</body>
		</html>
	);
}
