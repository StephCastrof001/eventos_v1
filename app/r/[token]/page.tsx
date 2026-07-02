import Image from "next/image";
import { notFound } from "next/navigation";
import { MeshBg } from "@/components/mesh-bg";
import logo from "@/Logo/hackia_primary_dark.svg";
import { createAdminSupabase } from "@/lib/supabase/server";

export default async function ScanPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	const sb = createAdminSupabase();
	const { data } = await sb
		.from("guests")
		.select("name, last_name")
		.eq("qr_token", token)
		.maybeSingle();

	if (!data) notFound();

	const fullName = [data.name, data.last_name].filter(Boolean).join(" ");

	return (
		<>
			<MeshBg />
			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-12 text-[#e8e8f0]">
				<header className="flex flex-col items-start gap-3">
					<Image src={logo} alt="HACK IA" height={26} className="w-auto" />
				</header>

				<section className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
					<div className="mb-2 text-4xl">🎫</div>
					<h1 className="text-2xl font-bold tracking-tight">
						Esta es tu entrada
					</h1>
					<p className="text-lg leading-relaxed text-white/80">
						<strong className="text-[#6f5ff2]">{fullName}</strong> — mostrá este
						QR al staff en la puerta para tu check-in.
					</p>
				</section>
			</main>
		</>
	);
}
