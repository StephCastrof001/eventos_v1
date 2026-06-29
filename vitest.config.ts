import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config(); // carga .env en process.env para tests de integración

export default defineConfig({
	resolve: {
		alias: { "@": path.resolve(__dirname) },
	},
	test: {
		// los *.integration.test.ts pegan a la DB real → fuera del run por defecto
		exclude: ["**/node_modules/**", "**/*.integration.test.ts"],
	},
});
