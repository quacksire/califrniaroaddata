import type { APIRoute } from "astro";
import { DATA_TYPE_IDS } from "../lib/road-data-api";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
	const document = {
		openapi: "3.1.1",
		info: {
			title: "California Road Data API",
			version: "1.0.0",
			description:
				"A read-only navigation API for California Road Data's digestible road-condition explorer. It returns canonical Explorer resources rather than raw feed records.",
		},
		servers: [{ url: url.origin }],
		paths: {
			"/api/health": {
				get: {
					summary: "Check API availability",
					responses: {
						"200": {
							description: "The API is available.",
							content: {
								"application/json": { schema: { type: "object" } },
							},
						},
					},
				},
			},
			"/api/metadata": {
				get: {
					summary: "List available road-data categories and districts",
					responses: {
						"200": {
							description: "Supported Explorer categories.",
							content: {
								"application/json": { schema: { type: "object" } },
							},
						},
					},
				},
			},
			"/api/explorer/{type}/{district}": {
				get: {
					summary: "Get a canonical digestible Explorer resource",
					description:
						"Returns the canonical California Road Data Explorer view for a category and district. This endpoint does not return raw records.",
					parameters: [
						{
							name: "type",
							in: "path",
							required: true,
							schema: { type: "string", enum: DATA_TYPE_IDS },
							description:
								"cctv (cameras), cms (message signs), cc (chain controls), lcs (lane closures), rwis (weather stations), or tt (travel times).",
						},
						{
							name: "district",
							in: "path",
							required: true,
							schema: { type: "string", pattern: "^(0[1-9]|1[0-2])$" },
							description: "Two-digit California Road Data district identifier.",
						},
					],
					responses: {
						"200": {
							description: "A canonical Explorer resource.",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											resource: {
												type: "object",
												required: ["name", "type", "district", "url", "mediaType"],
											},
										},
									},
								},
							},
						},
						"400": { description: "Unsupported data type or district." },
					},
				},
			},
		},
	};

	return new Response(JSON.stringify(document, null, 2), {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
			"Content-Type":
				"application/vnd.oai.openapi+json;version=3.1; charset=utf-8",
		},
	});
};
