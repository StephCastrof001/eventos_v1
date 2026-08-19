/**
 * Reduce una foto en el navegador antes de subirla.
 *
 * Por qué existe: Vercel corta el body de una función serverless en ~4.5 MB
 * (413 `FUNCTION_PAYLOAD_TOO_LARGE`, verificado en prod el 2026-08-19) y una
 * foto de celular pesa 3–8 MB. Sin esto, media puerta de invitados no puede
 * subir su foto. El badge se imprime chico: 1200px de lado mayor sobra.
 *
 * Bonus: el canvas re-encoda a JPEG, así que un HEIC de iPhone que el servidor
 * rechazaría por `invalid_type` entra igual si el navegador sabe decodificarlo.
 */

const MAX_EDGE = 1200;
const QUALITY = 0.85;
const OUTPUT_TYPE = "image/jpeg";

/**
 * Devuelve una versión reducida del archivo, o el original si el navegador no
 * puede procesarlo. NUNCA lanza: fallar acá significaría bloquear una subida
 * que hoy (con archivos chicos) funciona.
 */
export async function shrinkImage(file: File): Promise<File> {
	try {
		if (typeof createImageBitmap !== "function") return file;

		const bitmap = await createImageBitmap(file, {
			imageOrientation: "from-image",
		});
		const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
		const width = Math.round(bitmap.width * scale);
		const height = Math.round(bitmap.height * scale);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return file;
		ctx.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, OUTPUT_TYPE, QUALITY),
		);
		// Un PNG chico o un JPEG ya optimizado pueden salir más pesados al
		// re-encodar: en ese caso el original es la mejor opción.
		if (!blob || blob.size >= file.size) return file;

		return new File([blob], "foto.jpg", { type: OUTPUT_TYPE });
	} catch {
		return file;
	}
}
