export default function Home() {
	return (
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "0.5rem",
				background: "#0c0c14",
				color: "#e8e8f0",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h1 style={{ fontSize: "2rem", fontWeight: 700 }}>HACK IA</h1>
			<p style={{ color: "#9a9ab0" }}>
				Plataforma de eventos — v0.3 (scaffold)
			</p>
		</main>
	);
}
