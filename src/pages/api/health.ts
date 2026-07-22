import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ url }) =>
	new Response(
		JSON.stringify(
			{
				status: "ok",
				service: "California Road Data API",
				time: new Date().toISOString(),
				links: {
					openapi: `${url.origin}/openapi.json`,
					documentation: `${url.origin}/docs/api`,
					metadata: `${url.origin}/api/metadata`,
				},
			},
			null,
			2,
		),
		{
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "no-store",
				"Content-Type": "application/json; charset=utf-8",
			},
		},
	);
