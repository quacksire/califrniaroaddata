import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
	const catalog = {
		linkset: [
			{
				anchor: `${url.origin}/api`,
				"service-desc": [
					{
						href: `${url.origin}/openapi.json`,
						type: "application/vnd.oai.openapi+json;version=3.1",
					},
				],
				"service-doc": [
					{
						href: `${url.origin}/docs/api`,
						type: "text/html",
					},
				],
				status: [
					{
						href: `${url.origin}/api/health`,
						type: "application/json",
					},
				],
			},
		],
	};

	return new Response(JSON.stringify(catalog, null, 2), {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
			"Content-Type":
				'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"; charset=utf-8',
		},
	});
};
