import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const env = getEnv();

	const supabase = createServerClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value,
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value: "",
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
					});
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Proteger rutas admin + el escáner de check-in (/scan es staff-only).
	const path = request.nextUrl.pathname;
	const isProtected =
		(path.startsWith("/admin") && !path.startsWith("/admin/login")) ||
		path.startsWith("/scan");
	if (isProtected && !user) {
		const url = request.nextUrl.clone();
		url.pathname = "/admin/login";
		return NextResponse.redirect(url);
	}

	return response;
}
