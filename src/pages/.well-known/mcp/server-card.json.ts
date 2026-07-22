import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
	const card = {
		$schema:
			"https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
		name: "californiaroaddata.com/california-road-data",
		version: "1.0.0",
		title: "California Road Data Explorer",
		description:
			"California Road Data's read-only API layer for digestible live road-condition data by district.",
		websiteUrl: url.origin,
		repository: {
			url: "https://github.com/quacksire/califrniaroaddata",
			source: "github",
			id: "1109563543",
		},
		remotes: [
			{
				type: "streamable-http",
				url: `${url.origin}/mcp`,
				supportedProtocolVersions: ["2025-06-18"],
			},
		],
		// Retained while SEP-2127 clients migrate from the original card shape.
		serverInfo: {
			name: "California Road Data API",
			version: "1.0.0",
		},
		capabilities: {
			tools: { listChanged: false },
		},
	};

	return new Response(JSON.stringify(card, null, 2), {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
			"Content-Type": "application/mcp-server-card+json; charset=utf-8",
		},
	});
};
